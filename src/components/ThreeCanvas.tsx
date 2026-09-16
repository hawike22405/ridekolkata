import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { buildMainCycleModel, MainCycleHotspot, MainCycleInstance } from './MainCycleModel';
import { Sparkles, Eye, X, Upload, CheckCircle2, RefreshCw } from 'lucide-react';

interface ThreeCanvasProps {
  interactiveMode?: boolean;
  accentColor?: string;
  wireframeMode?: boolean;
  onModelInteract?: (status: string) => void;
  isDarkMode?: boolean;
  showHeadlight?: boolean;
}

export default function ThreeCanvas({
  interactiveMode = false,
  accentColor = '#ff5722',
  wireframeMode = false,
  isDarkMode = true,
}: ThreeCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<MainCycleHotspot | null>(null);
  const [activePreset, setActivePreset] = useState<string>('hero');
  const [modelStatus, setModelStatus] = useState<string>('Loading Main Cycle model...');
  const [isGlbLoaded, setIsGlbLoaded] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  // Keep references to controls inside the Three.js loop
  const cycleRef = useRef<MainCycleInstance | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.6, 6.2));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.15, 0));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDarkMode ? 0x07080a : 0xf8f9fa, 0.022);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.copy(targetCameraPos.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDarkMode ? 1.3 : 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear previous DOM canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, isDarkMode ? 1.2 : 1.6);
    scene.add(ambientLight);

    // Key Light tinted with dynamic accent
    const keyLight = new THREE.DirectionalLight(new THREE.Color(accentColor).getHex(), 3.2);
    keyLight.position.set(6, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Cool fill light
    const fillLight = new THREE.DirectionalLight(0x00f0ff, 1.6);
    fillLight.position.set(-6, 3, -4);
    scene.add(fillLight);

    // Rim/Back Light to pop silhouettes
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
    rimLight.position.set(0, 5, -6);
    scene.add(rimLight);

    // Ground point bounce light
    const groundBounce = new THREE.PointLight(0xff5722, 1.4, 12);
    groundBounce.position.set(0, -1.2, 2);
    scene.add(groundBounce);

    // Radial shadow ground plane
    const shadowGeo = new THREE.PlaneGeometry(6.5, 3.2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext('2d');
    if (sctx) {
      const grad = sctx.createRadialGradient(64, 64, 10, 64, 64, 64);
      grad.addColorStop(0, 'rgba(0,0,0,0.55)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.25)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.95;
    scene.add(shadowMesh);

    // --- BUILD MAIN CYCLE 3D MODEL (GLTF / gltfjsx specification) ---
    const cycle = buildMainCycleModel({
      accentColor,
      wireframeMode,
      isDarkMode,
      onLoaded: (status, isGlbActive) => {
        setModelStatus(status);
        if (typeof isGlbActive === 'boolean') {
          setIsGlbLoaded(isGlbActive);
        }
      },
    });
    cycleRef.current = cycle;
    scene.add(cycle.bikeGroup);

    // --- INTERACTIVE 3D HOTSPOT MARKERS ---
    const hotspotMarkers: { mesh: THREE.Group; hotspot: MainCycleHotspot }[] = [];
    if (interactiveMode) {
      cycle.hotspots.forEach((spot) => {
        const markerGroup = new THREE.Group();
        markerGroup.position.set(...spot.position);

        // Outer pulsing ring
        const ringGeo = new THREE.RingGeometry(0.08, 0.11, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x00ff66,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        markerGroup.add(ringMesh);

        // Center bright dot
        const dotGeo = new THREE.CircleGeometry(0.05, 16);
        const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const dotMesh = new THREE.Mesh(dotGeo, dotMat);
        markerGroup.add(dotMesh);

        markerGroup.userData = { isHotspot: true, spot };
        cycle.bikeGroup.add(markerGroup);
        hotspotMarkers.push({ mesh: markerGroup, hotspot: spot });
      });
    }

    // --- BACKGROUND KINETIC CYBER PARTICLES ---
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(accentColor),
      new THREE.Color(0x00ff66),
      new THREE.Color(0x00f0ff),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 32;
      positions[i + 1] = (Math.random() - 0.5) * 22;
      positions[i + 2] = (Math.random() - 0.5) * 26;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i] = c.r;
      colors[i + 1] = c.g;
      colors[i + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: isDarkMode ? 0.75 : 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- PARALLAX, ROTATION & INTERACTION STATE ---
    let mouseX = 0;
    let mouseY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let scrollProgress = 0;
    let isDragging = false;
    let previousPointerPos = { x: 0, y: 0 };
    let userRotY = 0.35;
    let userRotX = 0.08;
    let velRotY = 0;
    let velRotX = 0;
    let currentCameraPos = camera.position.clone();
    let currentLookAt = new THREE.Vector3(0, 0.15, 0);

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    // Pointer Event Handlers
    const onPointerMove = (e: MouseEvent) => {
      if (isDragging && interactiveMode) {
        const deltaX = e.clientX - previousPointerPos.x;
        const deltaY = e.clientY - previousPointerPos.y;
        velRotY = deltaX * 0.008;
        velRotX = deltaY * 0.008;
        userRotY += velRotY;
        userRotX += velRotX;
        userRotX = Math.max(-0.6, Math.min(0.6, userRotX));
        previousPointerPos = { x: e.clientX, y: e.clientY };
      } else {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      if (interactiveMode) {
        isDragging = true;
        previousPointerPos = { x: e.clientX, y: e.clientY };

        const rect = renderer.domElement.getBoundingClientRect();
        mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseVector, camera);
        const clickable = hotspotMarkers.map((h) => h.mesh);
        const intersects = raycaster.intersectObjects(clickable, true);

        if (intersects.length > 0) {
          let root: THREE.Object3D | null = intersects[0].object;
          while (root && !root.userData?.spot && root.parent) {
            root = root.parent;
          }
          if (root?.userData?.spot) {
            setActiveHotspot(root.userData.spot);
            isDragging = false;
          }
        }
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (interactiveMode) {
        // Only zoom if Ctrl or Meta is held (browser translates trackpad pinch to ctrlKey)
        if (!e.ctrlKey && !e.metaKey) return;
        
        e.preventDefault();
        const zoomDelta = e.deltaY * 0.005;
        const newDist = THREE.MathUtils.clamp(targetCameraPos.current.z + zoomDelta, 3.8, 9.8);
        targetCameraPos.current.z = newDist;
      }
    };

    // Touch Support
    const onTouchStart = (e: TouchEvent) => {
      if (interactiveMode && e.touches.length === 1) {
        isDragging = true;
        previousPointerPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (interactiveMode && isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousPointerPos.x;
        const deltaY = e.touches[0].clientY - previousPointerPos.y;
        userRotY += deltaX * 0.008;
        userRotX += deltaY * 0.008;
        userRotX = Math.max(-0.6, Math.min(0.6, userRotX));
        previousPointerPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        scrollProgress = window.scrollY / maxScroll;
      }
    };

    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('mousemove', onPointerMove);
    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      targetParallaxX += (mouseX - targetParallaxX) * 0.06;
      targetParallaxY += (mouseY - targetParallaxY) * 0.06;

      // Realistic wheel and crank rotation
      cycle.spinWheels(0.035);
      cycle.spinCranks(0.015);

      if (!isDragging && interactiveMode) {
        userRotY += velRotY;
        userRotX += velRotX;
        velRotY *= 0.94;
        velRotX *= 0.94;
      }

      // Hotspot pulse
      hotspotMarkers.forEach(({ mesh }, idx) => {
        mesh.quaternion.copy(camera.quaternion);
        const pulse = 1 + Math.sin(elapsedTime * 4 + idx * 1.5) * 0.15;
        mesh.scale.set(pulse, pulse, pulse);
      });

      // Positioning & View
      if (interactiveMode) {
        cycle.bikeGroup.rotation.y = userRotY;
        cycle.bikeGroup.rotation.x = userRotX;
        cycle.bikeGroup.rotation.z = 0;
        cycle.bikeGroup.position.set(0, -0.1, 0);

        currentCameraPos.lerp(targetCameraPos.current, 0.08);
        currentLookAt.lerp(targetLookAt.current, 0.08);
        camera.position.copy(currentCameraPos);
        camera.lookAt(currentLookAt);
      } else {
        const isDesktop = window.innerWidth >= 1024;
        const scrollAngle = scrollProgress * Math.PI * 2.2;
        const baseOffsetX = isDesktop ? 1.35 : 0.0;
        const baseOffsetY = isDesktop ? -0.15 : -0.25;

        cycle.bikeGroup.rotation.y = 0.38 + targetParallaxX * 0.35 + scrollAngle;
        cycle.bikeGroup.rotation.x = 0.06 - targetParallaxY * 0.18 + Math.sin(elapsedTime * 0.9) * 0.03;
        cycle.bikeGroup.rotation.z = Math.sin(elapsedTime * 1.3) * 0.02 - targetParallaxX * 0.08;

        cycle.bikeGroup.position.x = baseOffsetX + Math.sin(scrollProgress * Math.PI) * 1.2 - targetParallaxX * 0.4;
        cycle.bikeGroup.position.y = baseOffsetY + Math.cos(scrollProgress * Math.PI * 2) * 0.25 + Math.sin(elapsedTime * 1.4) * 0.06 - targetParallaxY * 0.2;
        cycle.bikeGroup.position.z = -scrollProgress * 2.2;

        camera.position.set(0, 0.65, 6.4);
        camera.lookAt(0, 0.15, 0);
      }

      particles.rotation.y = elapsedTime * 0.018;
      particles.position.y = targetParallaxY * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [interactiveMode, isDarkMode]);

  // Update dynamic properties
  useEffect(() => {
    if (cycleRef.current) {
      cycleRef.current.updateAccentColor(accentColor);
    }
  }, [accentColor]);

  useEffect(() => {
    if (cycleRef.current) {
      cycleRef.current.setWireframe(wireframeMode);
    }
  }, [wireframeMode]);

  // Camera Presets for Main Cycle
  const handleApplyPreset = (preset: 'hero' | 'side' | 'cockpit' | 'suspension' | 'drivetrain') => {
    setActivePreset(preset);
    setActiveHotspot(null);
    if (!targetCameraPos.current || !targetLookAt.current) return;

    switch (preset) {
      case 'hero':
        targetCameraPos.current.set(2.4, 1.1, 5.2);
        targetLookAt.current.set(0, 0.15, 0);
        break;
      case 'side':
        targetCameraPos.current.set(0, 0.35, 5.8);
        targetLookAt.current.set(0, 0.1, 0);
        break;
      case 'cockpit':
        targetCameraPos.current.set(1.1, 1.9, 1.7);
        targetLookAt.current.set(0.95, 1.25, 0);
        break;
      case 'suspension':
        targetCameraPos.current.set(-0.5, 0.8, 2.1);
        targetLookAt.current.set(-0.35, 0.35, 0);
        break;
      case 'drivetrain':
        targetCameraPos.current.set(-0.25, 0.15, 2.3);
        targetLookAt.current.set(0, -0.1, 0);
        break;
    }
  };

  // Drag & Drop / File Upload Handler
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setModelStatus(`Processing ${file.name}...`);
    try {
      const buffer = await file.arrayBuffer();
      if (cycleRef.current) {
        const success = await cycleRef.current.loadGlbFromBuffer(buffer, file.name);
        if (success) {
          setIsGlbLoaded(true);
          setModelStatus(`${file.name} Loaded & Active`);
        }
      }

      // Persist to server
      try {
        await fetch('/api/upload-model', {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: buffer,
        });
      } catch (e) {
        console.warn('Could not persist to /api/upload-model (dev server optional)', e);
      }
    } catch (err: any) {
      console.error('Failed to load uploaded model:', err);
      setModelStatus(`Error: ${err.message || 'Failed to read file'}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingFile) setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  return (
    <div
      onDragOver={interactiveMode ? handleDragOver : undefined}
      onDragLeave={interactiveMode ? handleDragLeave : undefined}
      onDrop={interactiveMode ? handleDrop : undefined}
      className={`w-full h-full select-none relative ${
        interactiveMode
          ? 'cursor-grab active:cursor-grabbing'
          : 'fixed inset-0 pointer-events-none z-0 overflow-hidden'
      }`}
    >
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Hidden File Input for GLB Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Drag & Drop Overlay Indicator */}
      {isDraggingFile && interactiveMode && (
        <div className="absolute inset-0 z-40 bg-primary/20 backdrop-blur-md flex flex-col items-center justify-center border-2 border-dashed border-primary pointer-events-none animate-pulse">
          <Upload className="w-12 h-12 text-primary mb-2" />
          <p className="font-headline-sm text-lg font-bold text-on-surface">
            Drop 'Main Cycle.glb' to Mount 3D Model
          </p>
          <p className="font-body-sm text-xs text-secondary">
            Auto-binds nodes (Fork, Damper, Frame, Wheels, Chain)
          </p>
        </div>
      )}

      {/* Interactive HUD Overlay for Studio / Interactive Mode */}
      {interactiveMode && (
        <>
          {/* Top Left: Active Preset & Model Status Indicator */}
          <div className="absolute top-16 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto max-w-[90vw]">
            <div className="flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-xl p-1 rounded-full border border-surface-container-high/60 shadow-lg">
              <button
                onClick={() => handleApplyPreset('hero')}
                className={`px-3 py-1 rounded-full font-label-caps text-label-caps text-xs font-bold transition-all cursor-pointer ${
                  activePreset === 'hero'
                    ? 'bg-primary-container text-on-primary-container shadow'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Hero 3/4
              </button>
              <button
                onClick={() => handleApplyPreset('side')}
                className={`px-3 py-1 rounded-full font-label-caps text-label-caps text-xs font-bold transition-all cursor-pointer ${
                  activePreset === 'side'
                    ? 'bg-primary-container text-on-primary-container shadow'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => handleApplyPreset('cockpit')}
                className={`px-3 py-1 rounded-full font-label-caps text-label-caps text-xs font-bold transition-all cursor-pointer ${
                  activePreset === 'cockpit'
                    ? 'bg-primary-container text-on-primary-container shadow'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Cockpit
              </button>
              <button
                onClick={() => handleApplyPreset('suspension')}
                className={`px-3 py-1 rounded-full font-label-caps text-label-caps text-xs font-bold transition-all cursor-pointer ${
                  activePreset === 'suspension'
                    ? 'bg-primary-container text-on-primary-container shadow'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Dual Shock
              </button>
              <button
                onClick={() => handleApplyPreset('drivetrain')}
                className={`px-3 py-1 rounded-full font-label-caps text-label-caps text-xs font-bold transition-all cursor-pointer ${
                  activePreset === 'drivetrain'
                    ? 'bg-primary-container text-on-primary-container shadow'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Drivetrain
              </button>
            </div>

            {/* Custom Model Upload Trigger Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload your custom 'Main Cycle.glb' file"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-caps text-xs font-bold bg-surface-container-lowest/90 backdrop-blur-xl text-on-surface border border-surface-container-high hover:border-primary/60 shadow-md cursor-pointer transition-all hover:bg-surface-container-low"
            >
              {isGlbLoaded ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-[#ff5722]" />
              )}
              <span>{isGlbLoaded ? 'GLB ACTIVE' : 'LOAD MAIN CYCLE.GLB'}</span>
            </button>
          </div>

          {/* Top Right: 3D Inspection Guide Pill */}
          <div className="hidden sm:flex absolute top-16 right-4 z-20 items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-xl border border-surface-container-high/60 text-secondary font-label-caps text-xs pointer-events-none">
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span>DRAG TO ROTATE • SCROLL TO ZOOM • DROP GLB FILE</span>
          </div>

          {/* Active Hotspot Telemetry Popout Card */}
          {activeHotspot && (
            <div className="absolute bottom-16 left-6 right-6 md:left-auto md:right-6 md:w-96 z-30 p-4 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-2xl border border-primary/40 shadow-2xl animate-fade-in pointer-events-auto">
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-surface-container-high">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  <span className="font-label-caps text-[11px] uppercase tracking-wider text-primary font-bold">
                    {activeHotspot.category}
                  </span>
                </div>
                <button
                  onClick={() => setActiveHotspot(null)}
                  className="p-1 rounded-full hover:bg-surface-container-high text-secondary hover:text-on-surface cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2.5 space-y-2">
                <h3 className="font-headline-sm text-base text-on-surface font-black">
                  {activeHotspot.title}
                </h3>
                <p className="font-body-sm text-xs text-secondary leading-relaxed">
                  {activeHotspot.description}
                </p>
                <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ff5722] shrink-0" />
                  <span className="font-mono text-[11px] font-bold text-on-surface">
                    {activeHotspot.specs}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
