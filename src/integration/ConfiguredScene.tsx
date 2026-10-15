import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Visual } from "./api";
import { fetchModel } from "./modelSafety";
function disposeModel(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>(),
    materials = new Set<THREE.Material>(),
    textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    if (mesh.material)
      for (const material of Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material])
        materials.add(material);
  });
  for (const material of materials)
    for (const value of Object.values(material))
      if (value instanceof THREE.Texture) textures.add(value);
  for (const texture of textures) {
    texture.dispose();
    const image = texture.image as { close?: () => void } | undefined;
    image?.close?.();
  }
  for (const material of materials) material.dispose();
  for (const geometry of geometries) geometry.dispose();
}
function checkModel(root: THREE.Object3D) {
  let objects = 0,
    vertices = 0,
    pixels = 0;
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    if (++objects > 3000) throw new Error("Model has too many objects.");
    if (
      ![
        ...object.position.toArray(),
        ...object.quaternion.toArray(),
        ...object.scale.toArray(),
      ].every(Number.isFinite)
    )
      throw new Error("Model has invalid transforms.");
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) {
      const position = mesh.geometry.getAttribute("position");
      if (position) {
        vertices += position.count;
        if (vertices > 1_000_000)
          throw new Error("Model exceeds the vertex budget.");
        for (let i = 0; i < position.array.length; i++)
          if (!Number.isFinite(position.array[i]))
            throw new Error("Model has invalid vertices.");
      }
    }
    if (mesh.material)
      for (const material of Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material])
        for (const value of Object.values(material))
          if (value instanceof THREE.Texture) textures.add(value);
  });
  for (const texture of textures) {
    const image = texture.image as
      { width: number; height: number } | undefined;
    if (image) {
      if (image.width > 4096 || image.height > 4096)
        throw new Error("Texture exceeds 4096 pixels.");
      pixels += image.width * image.height;
    }
  }
  if (pixels > 32_000_000) throw new Error("Model exceeds the texture budget.");
}
export default function ConfiguredScene({ config }: { config: Visual | null }) {
  const mount = useRef<HTMLDivElement>(null),
    apply = useRef<((config: Visual | null, view: number) => void) | null>(
      null,
    );
  const latest = useRef(config),
    paused = useRef(false);
  latest.current = config;
  const [message, setMessage] = useState("No 3D configuration available."),
    [view, setView] = useState(0),
    [isPaused, setPaused] = useState(false);
  useEffect(() => {
    paused.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    const container = mount.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "default",
      });
    } catch {
      setMessage("3D is unavailable on this device.");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(),
      ambient = new THREE.AmbientLight(),
      key = new THREE.DirectionalLight(),
      rim = new THREE.DirectionalLight();
    key.position.set(5, 8, 5);
    rim.position.set(-5, 4, -5);
    scene.add(ambient, key, rim);
    let model: THREE.Object3D | null = null,
      pivot: THREE.Group | null = null,
      assetKey = "",
      generation = 0,
      abort: AbortController | null = null,
      dead = false,
      lost = false,
      active: Visual | null = null,
      currentView = 0;
    const clear = () => {
      if (model) {
        scene.remove(model);
        disposeModel(model);
      }
      model = null;
      pivot = null;
      assetKey = "";
    };
    const settings = () => {
      if (!active) return;
      const c = active.data;
      scene.background = new THREE.Color(c.hexColors.background);
      ambient.color.set(c.hexColors.primary);
      key.color.set(c.hexColors.primary);
      rim.color.set(c.hexColors.accent);
      ambient.intensity = c.lightingIntensity;
      key.intensity = c.lightingIntensity;
      rim.intensity = c.lightingIntensity;
      camera.fov = c.cameraFov;
      camera.near = 0.01;
      camera.far = 50000;
      const pose =
        c.cameraPivotPoints[
          Math.min(currentView, c.cameraPivotPoints.length - 1)
        ];
      camera.position.fromArray(pose.position);
      camera.quaternion.fromArray(pose.rotationQuaternion);
      camera.updateProjectionMatrix();
      if (model) {
        model.scale.setScalar(c.modelScale);
        model.quaternion.fromArray(c.modelRotationQuaternion);
      }
    };
    const resize = new ResizeObserver(() => {
      const w = Math.max(1, container.clientWidth),
        h = Math.max(1, container.clientHeight);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resize.observe(container);
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      if (url.startsWith("blob:") || url.startsWith("data:")) return url;
      throw new Error("External model dependencies are not allowed.");
    });
    apply.current = (value, index) => {
      active = value;
      currentView = index;
      settings();
      if (!value) {
        abort?.abort();
        generation++;
        clear();
        scene.background = null;
        renderer.clear();
        setMessage("No 3D configuration available.");
        return;
      }
      if (lost) return;
      const nextKey =
        value.data.modelUrl +
        "|" +
        JSON.stringify(value.data.drivetrainBinding ?? null);
      if (nextKey === assetKey && model) return;
      const own = ++generation;
      abort?.abort();
      abort = new AbortController();
      const signal = abort.signal;
      clear();
      setMessage("Loading configured model…");
      fetchModel(value.data.modelUrl, signal)
        .then((bytes) => new GLTFLoader(manager).parseAsync(bytes, ""))
        .then((gltf) => {
          if (dead || own !== generation || signal.aborted) {
            disposeModel(gltf.scene);
            return;
          }
          try {
            checkModel(gltf.scene);
            model = gltf.scene;
            scene.add(model);
            settings();
            const binding = value.data.drivetrainBinding;
            if (binding) {
              const matches: THREE.Object3D[] = [];
              model.traverse((node) => {
                if (node.name === binding.nodeName) matches.push(node);
              });
              if (matches.length !== 1 || matches[0] === model)
                throw new Error(
                  "Drivetrain binding must identify exactly one model node.",
                );
              model.updateMatrixWorld(true);
              pivot = new THREE.Group();
              pivot.position.fromArray(binding.pivot);
              model.add(pivot);
              pivot.attach(matches[0]);
            }
            assetKey = nextKey;
            setMessage(
              binding
                ? "Configured model loaded."
                : value.data.drivetrainAnimationSpeed > 0
                  ? "Model loaded. Drivetrain binding is not configured."
                  : "Configured model loaded.",
            );
          } catch (error) {
            if (model !== gltf.scene) disposeModel(gltf.scene);
            clear();
            setMessage(
              error instanceof Error
                ? error.message
                : "Model could not be displayed.",
            );
          }
        })
        .catch((error) => {
          if (!dead && own === generation && !signal.aborted) {
            clear();
            setMessage(
              error instanceof Error
                ? error.message
                : "Model could not be loaded.",
            );
          }
        });
    };
    let last = 0;
    renderer.setAnimationLoop((time: number) => {
      if (dead || lost) return;
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;
      if (pivot && active?.data.drivetrainBinding && !paused.current)
        pivot.rotation[active.data.drivetrainBinding.axis] +=
          active.data.drivetrainAnimationSpeed * dt;
      try {
        if (active) renderer.render(scene, camera);
      } catch {
        setMessage("The graphics device could not render this model.");
        renderer.setAnimationLoop(null);
      }
    });
    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      abort?.abort();
      generation++;
      clear();
      setMessage("Graphics context lost. Waiting for the device to recover…");
    };
    const onRestored = () => {
      lost = false;
      assetKey = "";
      apply.current?.(latest.current, 0);
    };
    renderer.domElement.addEventListener("webglcontextlost", onLost);
    renderer.domElement.addEventListener("webglcontextrestored", onRestored);
    apply.current(latest.current, 0);
    return () => {
      dead = true;
      apply.current = null;
      abort?.abort();
      generation++;
      resize.disconnect();
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        onRestored,
      );
      clear();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);
  useEffect(() => {
    apply.current?.(config, view);
  }, [config?.revision, view]);
  return (
    <section className="scene-card" aria-label="Configured bicycle model">
      <div ref={mount} className="scene-mount" />
      <div className="scene-toolbar">
        <span role="status">{message}</span>
        {config && (
          <div className="scene-actions">
            {config.data.cameraPivotPoints.map((_, i) => (
              <button
                key={i}
                aria-pressed={view === i}
                onClick={() => setView(i)}
              >
                View {i + 1}
              </button>
            ))}
            <button onClick={() => setPaused((v) => !v)}>
              {isPaused ? "Play" : "Pause"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
