import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Text } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { MapPin, Bike, Navigation } from "lucide-react";

interface Cycle {
  id: number;
  name: string;
  type: string;
  price: number;
  location: [number, number];
  description: string;
  rating: number;
}

interface Globe3DProps {
  cycles: Cycle[];
  selectedCycle: Cycle | null;
  onSelectCycle: (cycle: Cycle) => void;
  className?: string;
}

function Globe({ radius = 3 }: { radius: number }) {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <mesh ref={sphereRef} receiveShadow>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        color="#1A1A1A"
        roughness={0.8}
        metalness={0.1}
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

function GlobeWireframe({ radius = 3.05 }: { radius: number }) {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y -= 0.0002;
    }
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial
        color="#FFD700"
        transparent
        opacity={0.1}
        wireframe
        depthWrite={false}
      />
    </mesh>
  );
}

function PulseRing({ radius = 3.2 }: { radius: number }) {
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0.3);

  useFrame((_, delta) => {
    const newScale = scale + delta * 0.3;
    if (newScale > 1.5) {
      setScale(1);
      setOpacity(0.3);
    } else {
      setScale(newScale);
      setOpacity(0.3 * (1 - (newScale - 1) / 0.5));
    }
  });

  return (
    <mesh
      scale={[scale, scale, scale]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[radius, radius + 0.1, 64]} />
      <meshBasicMaterial
        color="#FFD700"
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function KolkataMarker({ position = [22.5726, 88.3639] }: { position: [number, number] }) {
  const [lat, lng] = position;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = 3.1 * Math.sin(phi) * Math.cos(theta);
  const y = 3.1 * Math.cos(phi);
  const z = 3.1 * Math.sin(phi) * Math.sin(theta);

  const [pulse, setPulse] = useState(1);

  useFrame((_, delta) => {
    setPulse(p => p + delta * 3);
  });

  return (
    <group position={[x, y, z]}>
      {/* Pulsing base */}
      <mesh
        scale={[1 + Math.sin(pulse) * 0.2, 1 + Math.sin(pulse) * 0.2, 1 + Math.sin(pulse) * 0.2]}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* Core marker */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={1}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>

      {/* Label */}
      <Html
        position={[0, 0.2, 0]}
        style={{
          textAlign: "center",
          color: "#1A1A1A",
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: "11px",
          fontWeight: 600,
          whiteSpace: "nowrap",
          textShadow: "0 0 4px rgba(255,255,255,0.8)",
        }}
      >
        Kolkata
      </Html>
    </group>
  );
}

function CycleMarker({
  cycle,
  selected,
  onClick,
}: {
  cycle: Cycle;
  selected: boolean;
  onClick: () => void;
}) {
  const [lat, lng] = cycle.location;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const radius = 3.1;
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  const [hovered, setHovered] = useState(false);
  const [bounce, setBounce] = useState(0);

  useFrame((_, delta) => {
    if (selected || hovered) {
      setBounce(b => b + delta * 5);
    }
  });

  const bounceY = Math.sin(bounce) * 0.15;

  const config = {
    Standard: { color: "#1A1A1A", accent: "#FFD700" },
    MTB: { color: "#2D5A27", accent: "#FF4500" },
    Electric: { color: "#0D1B2A", accent: "#00D4FF" },
    Classic: { color: "#8B4513", accent: "#DAA520" },
  }[cycle.type] || { color: "#1A1A1A", accent: "#FFD700" };

  return (
    <group
      position={[x, y + bounceY, z]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Pulsing ring when selected/hovered */}
      {(selected || hovered) && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          scale={selected ? 1.5 : 1.2}
        >
          <ringGeometry args={[0.15, 0.25, 32]} />
          <meshBasicMaterial
            color={config.accent}
            transparent
            opacity={selected ? 0.6 : 0.4}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Bike icon as 3D object */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* Mini bike frame */}
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
          <meshStandardMaterial color={config.color} metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Wheels */}
        <group position={[-0.1, 0, -0.15]}>
          <torusGeometry args={[0.08, 0.015, 6, 16]} />
          <meshStandardMaterial color={config.color} metalness={0.5} roughness={0.3} />
        </group>
        <group position={[0.1, 0, -0.15]}>
          <torusGeometry args={[0.08, 0.015, 6, 16]} />
          <meshStandardMaterial color={config.color} metalness={0.5} roughness={0.3} />
        </group>
      </group>

      {/* Tooltip */}
      {(hovered || selected) && (
        <Html
          position={[0, 0.5, 0]}
          style={{
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "rgba(26, 26, 26, 0.95)",
              color: "#FFD700",
              padding: "8px 12px",
              borderRadius: "10px",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              border: `1px solid ${config.accent}40`,
              backdropFilter: "blur(10px)",
              whiteSpace: "nowrap",
            }}
          >
            {cycle.name} - ₹{cycle.price}/hr
          </div>
        </Html>
      )}
    </group>
  );
}

function Atmosphere({ radius = 3.5 }: { radius: number }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial
        color="#FFD700"
        transparent
        opacity={0.02}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Stars() {
  const positions = useMemo(() => {
    const arr = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000 * 3; i += 3) {
      const r = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i] = r * Math.sin(phi) * Math.cos(theta);
      arr[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color="#FFFFFF"
        size={0.1}
        transparent
        opacity={0.6}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}

function LightingRig() {
  return (
    <>
      <ambientLight intensity={0.4} color="#FFF8E7" />
      <directionalLight
        position={[10, 10, 10]}
        intensity={2}
        color="#FFFDE7"
        castShadow
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#FFE082" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFD700" decay={2} distance={20} />
    </>
  );
}

function GlobeScene({
  cycles,
  selectedCycle,
  onSelectCycle,
}: {
  cycles: Cycle[];
  selectedCycle: Cycle | null;
  onSelectCycle: (cycle: Cycle) => void;
}) {
  return (
    <>
      <Stars />
      <Atmosphere />
      <GlobeWireframe />
      <Globe />
      <PulseRing />
      <KolkataMarker position={[22.5726, 88.3639]} />
      {cycles.map((cycle) => (
        <CycleMarker
          key={cycle.id}
          cycle={cycle}
          selected={selectedCycle?.id === cycle.id}
          onClick={() => onSelectCycle(cycle)}
        />
      ))}
      <LightingRig />
    </>
  );
}

export function Globe3D({
  cycles,
  selectedCycle,
  onSelectCycle,
  className = "",
}: Globe3DProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", minHeight: "500px" }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 40 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        style={{ outline: "none" }}
        shadows
        dpr={[1, 2]}
      >
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
        <Suspense fallback={<LoadingState />}>
          <GlobeScene cycles={cycles} selectedCycle={selectedCycle} onSelectCycle={onSelectCycle} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function LoadingState() {
  return (
    <Html fullscreen style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F5F5" }}>
      <div style={{ textAlign: "center", color: "#1A1A1A", fontFamily: "Space Grotesk, sans-serif" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            border: "4px solid #FFD700",
            borderTopColor: "transparent",
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 1s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Loading 3D Globe</h3>
        <p style={{ color: "#666" }}>Rendering Kolkata cycling network...</p>
      </div>
    </Html>
  );
}