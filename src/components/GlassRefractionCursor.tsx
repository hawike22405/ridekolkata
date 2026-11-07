import { useEffect, useRef } from "react";
import * as THREE from "three";

type GlassCursorProps = {
  src: string;
  alt: string;
  className?: string;
  /** Strength of the distortion applied through the glass. */
  refraction?: number;
  /** Radius in UV space (relative to the shorter side). */
  radius?: number;
  /** Number of points in the soft trailing lens. */
  trailLength?: number;
};

const MAX_POINTS = 24;

// An original, dependency-free (apart from the project's existing Three.js)
// metaball glass shader. This is not React Bits Pro source code.
const fragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform vec2 uResolution;
  uniform vec2 uImageSize;
  uniform vec3 uTrail[24];
  uniform float uRadius;
  uniform float uRefraction;
  uniform float uTime;

  vec2 coverUv(vec2 uv) {
    vec2 imageView = uImageSize * max(
      uResolution.x / uImageSize.x,
      uResolution.y / uImageSize.y
    );
    return (uv - 0.5) * uResolution / imageView + 0.5;
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 position = vec2(vUv.x * aspect, vUv.y);
    float field = 0.0;
    vec2 gradient = vec2(0.0);

    for (int i = 0; i < 24; i++) {
      vec3 point = uTrail[i];
      float strength = point.z;
      vec2 delta = position - vec2(point.x * aspect, point.y);
      float progress = float(i) / 24.0;
      float r = uRadius * mix(1.0, 0.56, progress);
      float distanceSquared = dot(delta, delta) / max(r * r, 0.00001);
      float falloff = exp(-2.1 * distanceSquared) * strength;
      field += falloff;
      gradient += (-4.2 / max(r * r, 0.00001)) * delta * falloff;
    }

    float lens = smoothstep(0.13, 0.73, field);
    float edge = smoothstep(0.16, 0.62, field) *
                 (1.0 - smoothstep(0.68, 1.1, field));
    // Derivative of the density field gives the appearance of curved glass.
    vec2 bend = gradient / max(1.0, length(gradient));
    vec2 displaced = vUv - vec2(bend.x / aspect, bend.y) *
      uRefraction * lens * 0.065;
    vec3 undistorted = texture2D(uImage, coverUv(vUv)).rgb;
    vec3 refracted = texture2D(uImage, coverUv(displaced)).rgb;
    float specular = pow(max(0.0, dot(normalize(vec3(-bend, 0.5)),
                                     normalize(vec3(-0.55, 0.8, 0.9)))), 9.0);
    vec3 tint = vec3(0.75, 1.0, 0.8);
    vec3 finalColor = mix(undistorted, refracted, lens * 0.97);
    finalColor += tint * edge * (0.12 + specular * 0.12);
    finalColor += vec3(0.04, 0.07, 0.045) * lens;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Image-backed glass lens with a refracting cursor trail.
 * Uses the local image only and keeps a plain image visible if WebGL is absent.
 */
export default function GlassRefractionCursor({
  src,
  alt,
  className = "",
  refraction = 0.55,
  radius = 0.095,
  trailLength = 15,
}: GlassCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: "low-power",
      });
    } catch {
      return; // The ordinary HTML image is the accessible fallback.
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.className = "glass-cursor-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const points = Array.from({ length: MAX_POINTS }, () => new THREE.Vector3(-10, -10, 0));
    const shader = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uImage: { value: null },
        uImageSize: { value: new THREE.Vector2(1, 1) },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTrail: { value: points },
        uRadius: { value: radius },
        uRefraction: { value: refraction },
        uTime: { value: 0 },
      },
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, shader);
    const scene = new THREE.Scene();
    scene.add(mesh);
    const camera = new THREE.Camera();

    let disposed = false;
    let texture: THREE.Texture | undefined;
    let loaded = false;
    const loader = new THREE.TextureLoader();
    loader.load(
      src,
      (value) => {
        if (disposed) {
          value.dispose();
          return;
        }
        texture = value;
        value.colorSpace = THREE.SRGBColorSpace;
        value.minFilter = THREE.LinearFilter;
        value.magFilter = THREE.LinearFilter;
        shader.uniforms.uImage.value = value;
        const image = value.image as HTMLImageElement;
        shader.uniforms.uImageSize.value.set(image.naturalWidth, image.naturalHeight);
        loaded = true;
        renderer.domElement.style.opacity = "1";
        renderer.render(scene, camera);
      },
      undefined,
      () => {
        // Failure to decode an image should never obscure its HTML fallback.
        renderer.domElement.style.opacity = "0";
      },
    );

    const resize = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      renderer.setSize(w, h, false);
      shader.uniforms.uResolution.value.set(w, h);
      if (loaded) renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    let hovering = false;
    let lastInsert = 0;
    let frame = 0;
    const target = new THREE.Vector2(-10, -10);
    const smoothed = new THREE.Vector2(-10, -10);
    const count = Math.max(1, Math.min(MAX_POINTS, Math.round(trailLength)));

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const bounds = container.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      target.set(
        THREE.MathUtils.clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
        THREE.MathUtils.clamp(1 - (event.clientY - bounds.top) / bounds.height, 0, 1),
      );
      if (!hovering) smoothed.copy(target);
      hovering = true;
    };
    const onPointerLeave = () => {
      hovering = false;
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    let previousTime = 0;
    const animate = (time: number) => {
      frame = requestAnimationFrame(animate);
      if (!loaded || document.hidden) {
        previousTime = time;
        return;
      }
      const dt = Math.min(previousTime ? (time - previousTime) / 1000 : 1 / 60, 0.05);
      previousTime = time;
      if (hovering) {
        smoothed.lerp(target, 1 - Math.exp(-dt * 19));
        if (time - lastInsert >= 20) {
          for (let i = count - 1; i > 0; i--) points[i].copy(points[i - 1]);
          points[0].set(smoothed.x, smoothed.y, 1);
          lastInsert = time;
        }
      }
      for (let i = 0; i < count; i++) {
        if (!hovering) points[i].z *= Math.exp(-dt * 5);
        // The head is strongest, followed by progressively smaller droplets.
        const weight = 1 - i / count;
        if (hovering) points[i].z = points[i].x < 0 ? 0 : weight * 0.97;
        else points[i].z = Math.min(points[i].z, weight);
      }
      shader.uniforms.uTime.value = time * 0.001;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      texture?.dispose();
      geometry.dispose();
      shader.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [src, refraction, radius, trailLength]);

  return (
    <div ref={containerRef} className={`glass-cursor-stage ${className}`}>
      <img src={src} alt={alt} className="glass-cursor-image" loading="lazy" />
      <div className="glass-cursor-label" aria-hidden="true">
        <span className="glass-cursor-dot" />
        MOVE TO EXPLORE
      </div>
    </div>
  );
}
