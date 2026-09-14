import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sphere, Torus, MeshDistortMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Suspense, useRef, useState, useEffect } from "react";
import * as THREE from "three";

function FloatingShapes() {
  const group = useRef<THREE.Group>(null);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useFrame((_, delta) => {
    if (group.current) {
      const targetRotationY = scrollY * 0.002;
      const targetRotationX = scrollY * 0.001;
      
      group.current.rotation.y += (targetRotationY - group.current.rotation.y) * 0.05;
      group.current.rotation.x += (targetRotationX - group.current.rotation.x) * 0.05;

      group.current.position.x += (mousePosition.x * 2 - group.current.position.x) * 0.05;
      group.current.position.y += (mousePosition.y * 2 - group.current.position.y) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <Torus args={[2, 0.4, 32, 100]} position={[-4, 2, -5]} rotation={[1, 0.5, 0]}>
          <MeshDistortMaterial color="#FFD700" distort={0.4} speed={2} roughness={0.1} metalness={0.9} emissive="#FFD700" emissiveIntensity={0.5} />
        </Torus>
      </Float>

      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
        <Sphere args={[1.5, 64, 64]} position={[5, -2, -6]}>
          <MeshDistortMaterial color="#FF4500" distort={0.5} speed={3} roughness={0.1} metalness={0.8} emissive="#FF4500" emissiveIntensity={0.5} />
        </Sphere>
      </Float>

      <Float speed={2.5} rotationIntensity={1} floatIntensity={3}>
        <Torus args={[1, 0.3, 16, 50]} position={[3, 4, -8]} rotation={[0, 1, 0.5]}>
          <MeshDistortMaterial color="#1A1A1A" distort={0.2} speed={1.5} roughness={0.5} metalness={0.9} />
        </Torus>
      </Float>
      
      <Float speed={1.2} rotationIntensity={3} floatIntensity={2}>
        <mesh position={[-5, -4, -6]} rotation={[0.5, 0.2, 0.1]}>
          <icosahedronGeometry args={[1.8, 0]} />
          <meshStandardMaterial color="#ffffff" wireframe emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.5}>
        <Sphere args={[0.5, 32, 32]} position={[0, 3, -4]}>
          <meshStandardMaterial color="#00D4FF" roughness={0.2} metalness={0.8} emissive="#00D4FF" emissiveIntensity={1} />
        </Sphere>
      </Float>
    </group>
  );
}

export function InteractiveBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none w-full h-full">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#FFD700" />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <FloatingShapes />
          <EffectComposer>
            <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={1.5} />
            <ChromaticAberration 
              offset={new THREE.Vector2(0.002, 0.002)}
              blendFunction={BlendFunction.NORMAL} 
            />
            <Noise opacity={0.02} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
