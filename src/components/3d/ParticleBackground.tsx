import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

interface ParticleBackgroundProps {
  className?: string;
  numParticles?: number;
  color?: string;
  size?: number;
}

function Particles({ numParticles = 2000, color = "#FFD700", size = 0.02 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(numParticles * 3);
    for (let i = 0; i < numParticles * 3; i += 3) {
      const radius = 5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, [numParticles]);

  const velocities = useMemo(() => {
    const arr = new Float32Array(numParticles * 3);
    for (let i = 0; i < numParticles * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 0.0005;
      arr[i + 1] = (Math.random() - 0.5) * 0.0005;
      arr[i + 2] = (Math.random() - 0.5) * 0.0005;
    }
    return arr;
  }, [numParticles]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color,
        size,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    [color, size]
  );

  const pointsRef = useFrame((state, delta) => {
    const pos = (state as any).context.pointsRef?.current?.geometry?.attributes?.position;
    if (!pos) return;
    const array = pos.array as Float32Array;
    for (let i = 0; i < array.length; i += 3) {
      array[i] += velocities[i] * delta * 60;
      array[i + 1] += velocities[i + 1] * delta * 60;
      array[i + 2] += velocities[i + 2] * delta * 60;

      const dist = Math.sqrt(array[i] ** 2 + array[i + 1] ** 2 + array[i + 2] ** 2);
      if (dist > 15) {
        const radius = 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        array[i] = radius * Math.sin(phi) * Math.cos(theta);
        array[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        array[i + 2] = radius * Math.cos(phi);
      }
    }
    pos.needsUpdate = true;
  }, {});

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}

function SceneWrapper({ numParticles, color, size }: ParticleBackgroundProps) {
  return (
    <>
      <color attach="background" args={["#F5F5F5"]} />
      <Particles numParticles={numParticles} color={color} size={size} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7]} intensity={0.5} />
    </>
  );
}

export function ParticleBackground({
  className = "",
  numParticles = 1500,
  color = "#FFD700",
  size = 0.015,
}: ParticleBackgroundProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 20], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ outline: "none" }}
      >
        <SceneWrapper numParticles={numParticles} color={color} size={size} />
      </Canvas>
    </div>
  );
}