import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls, Html, PerspectiveCamera } from "@react-three/drei";

interface BikeViewerProps {
  type: "Standard" | "MTB" | "Electric" | "Classic";
  className?: string;
  interactive?: boolean;
}

const bikeConfigs = {
  Standard: {
    frameColor: "#1A1A1A",
    accentColor: "#FFD700",
    wheelColor: "#333333",
    tireColor: "#111111",
    scale: 1,
  },
  MTB: {
    frameColor: "#2D5A27",
    accentColor: "#FF4500",
    wheelColor: "#1A1A1A",
    tireColor: "#3D2B1F",
    scale: 1.1,
  },
  Electric: {
    frameColor: "#0D1B2A",
    accentColor: "#00D4FF",
    wheelColor: "#1E3A5F",
    tireColor: "#111111",
    scale: 1,
  },
  Classic: {
    frameColor: "#8B4513",
    accentColor: "#DAA520",
    wheelColor: "#5D4E37",
    tireColor: "#3D2B1F",
    scale: 0.95,
  },
};

function BikeModel({ type, onLoad }: { type: string; onLoad?: () => void }) {
  const config = bikeConfigs[type as keyof typeof bikeConfigs];
  const groupRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<[THREE.Mesh | null, THREE.Mesh | null]>([null, null]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
    wheelRefs.current.forEach((wheel) => {
      if (wheel) wheel.rotation.x -= delta * 4;
    });
  });

  useFrame(() => {
    if (groupRef.current && onLoad) {
      onLoad();
      onLoad = undefined as any;
    }
  });

  return (
    <group ref={groupRef} scale={config.scale}>
      {/* Frame - Main triangle */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.08, 2.2, 8]} />
        <meshStandardMaterial color={config.frameColor} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Top tube */}
      <mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.5, 8]} />
        <meshStandardMaterial color={config.frameColor} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Down tube */}
      <mesh position={[-0.5, -0.2, 0]} rotation={[0, 0, -0.5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.1, 1.8, 8]} />
        <meshStandardMaterial color={config.frameColor} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Seat tube */}
      <mesh position={[0.5, 0.2, 0]} rotation={[0, 0, 0.3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.2, 8]} />
        <meshStandardMaterial color={config.frameColor} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Seat post */}
      <mesh position={[0.6, 1.0, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color={config.frameColor} metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Saddle */}
      <mesh position={[0.6, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.08, 0.2]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
      </mesh>

      {/* Handlebars */}
      <mesh position={[-1.1, 1.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Front fork */}
      <mesh position={[-1.1, 0.2, 0]} rotation={[0, 0, -0.15]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
        <meshStandardMaterial color={config.frameColor} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Rear triangle stays */}
      <mesh position={[1.0, -0.2, 0.15]} rotation={[0, 0, -0.4]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.0, 8]} />
        <meshStandardMaterial color={config.frameColor} metalness={0.3} roughness={0.4} />
      </mesh>

      <mesh position={[1.0, -0.2, -0.15]} rotation={[0, 0, -0.4]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.0, 8]} />
        <meshStandardMaterial color={config.frameColor} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Chain stays */}
      <mesh position={[1.0, -0.6, 0.1]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.8, 8]} />
        <meshStandardMaterial color={config.frameColor} metalness={0.3} roughness={0.4} />
      </mesh>

      <mesh position={[1.0, -0.6, -0.1]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.8, 8]} />
        <meshStandardMaterial color={config.frameColor} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Front wheel */}
      <group position={[-1.1, -0.5, 0]}>
        <mesh
          ref={(el) => (wheelRefs.current[0] = el)}
          castShadow
          receiveShadow
        >
          <torusGeometry args={[0.55, 0.04, 8, 32]} />
          <meshStandardMaterial color={config.wheelColor} metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Tire */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={[0.55, 0.07, 8, 32]} />
          <meshStandardMaterial color={config.tireColor} roughness={0.9} />
        </mesh>
        {/* Spokes */}
        <mesh castShadow receiveShadow>
          <circleGeometry args={[0.5, 16]} />
          <meshStandardMaterial color={config.wheelColor} side={THREE.DoubleSide} metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Hub */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
          <meshStandardMaterial color={config.accentColor} metalness={0.8} roughness={0.1} />
        </mesh>
      </group>

      {/* Rear wheel */}
      <group position={[1.0, -0.5, 0]}>
        <mesh
          ref={(el) => (wheelRefs.current[1] = el)}
          castShadow
          receiveShadow
        >
          <torusGeometry args={[0.55, 0.04, 8, 32]} />
          <meshStandardMaterial color={config.wheelColor} metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh castShadow receiveShadow>
          <torusGeometry args={[0.55, 0.07, 8, 32]} />
          <meshStandardMaterial color={config.tireColor} roughness={0.9} />
        </mesh>
        <mesh castShadow receiveShadow>
          <circleGeometry args={[0.5, 16]} />
          <meshStandardMaterial color={config.wheelColor} side={THREE.DoubleSide} metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Rear hub with sprocket */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.15, 16]} />
          <meshStandardMaterial color={config.accentColor} metalness={0.8} roughness={0.1} />
        </mesh>
        {/* Sprocket */}
        <mesh position={[0, 0, 0.1]} castShadow receiveShadow>
          <circleGeometry args={[0.12, 12]} />
          <meshStandardMaterial color={config.accentColor} side={THREE.DoubleSide} metalness={0.8} roughness={0.1} />
        </mesh>
      </group>

      {/* Pedals / Crankset */}
      <group position={[0.1, -0.3, 0.18]}>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
          <meshStandardMaterial color={config.accentColor} metalness={0.8} roughness={0.1} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.15, 0.04, 0.04]} />
          <meshStandardMaterial color="#333" roughness={0.5} />
        </mesh>
      </group>

      <group position={[0.1, -0.3, -0.18]}>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
          <meshStandardMaterial color={config.accentColor} metalness={0.8} roughness={0.1} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.15, 0.04, 0.04]} />
          <meshStandardMaterial color="#333" roughness={0.5} />
        </mesh>
      </group>

      {/* Electric bike battery pack */}
      {type === "Electric" && (
        <group position={[0.2, -0.1, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, 0.3, 0.2]} />
            <meshStandardMaterial color="#0D1B2A" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0, 0.12]} scale={[0.9, 0.8, 0.5]}>
            <boxGeometry args={[0.8, 0.3, 0.2]} />
            <meshStandardMaterial color={config.accentColor} metalness={0.8} roughness={0.1} transparent opacity={0.3} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.3, 0, 0.1]} scale={[0.3, 0.3, 0.5]}>
            <boxGeometry args={[0.3, 0.1, 0.1]} />
            <meshStandardMaterial color={config.accentColor} metalness={0.9} roughness={0.05} emissive={config.accentColor} emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* MTB suspension fork */}
      {type === "MTB" && (
        <group position={[-1.1, 0.2, 0]}>
          <mesh castShadow receiveShadow position={[0, -0.3, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
            <meshStandardMaterial color="#555" metalness={0.8} roughness={0.1} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, -0.6, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
            <meshStandardMaterial color="#333" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* Classic bike basket */}
      {type === "Classic" && (
        <group position={[-1.1, 1.4, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.4, 0.25, 0.3]} />
            <meshStandardMaterial color="#8B4513" roughness={0.7} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.15, 0]} scale={[0.9, 0.2, 0.9]}>
            <boxGeometry args={[0.4, 0.25, 0.3]} />
            <meshStandardMaterial color="#8B4513" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* Accent details - head badge */}
      <mesh position={[-1.0, 1.0, 0]} castShadow receiveShadow>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color={config.accentColor} side={THREE.DoubleSide} metalness={0.9} roughness={0.05} />
      </mesh>
    </group>
  );
}

function BikeScene({ type, interactive = true }: { type: string; interactive?: boolean }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <group rotation={[-Math.PI / 8, 0, 0]}>
        <BikeModel type={type} onLoad={() => setLoaded(true)} />
      </group>

      {/* Ground plane with shadow catcher */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial
          color="#F5F5F5"
          transparent
          opacity={0}
          shadowSide={THREE.BackSide}
        />
      </mesh>

      {/* Subtle gradient floor reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.19, 0]}>
        <circleGeometry args={[2.5, 64]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.8} color="#FFF8E7" />
      <directionalLight
        position={[5, 10, 7]}
        intensity={2}
        color="#FFFDE7"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#FFE082" />
      <hemisphereLight groundColor="#F5F5F5" skyColor="#FFFDE7" intensity={0.5} />

      {/* Rim lights for drama */}
      <pointLight position={[3, 3, 3]} intensity={0.5} color="#FFD700" decay={2} distance={10} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#FF4500" decay={2} distance={10} />
    </>
  );
}

export function BikeViewer({ type = "Standard", className = "", interactive = true }: BikeViewerProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", minHeight: "400px" }}>
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 35 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        style={{ outline: "none" }}
        shadows
      >
        <Suspense fallback={<LoadingState type={type} />}>
          <BikeScene type={type} interactive={interactive} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function LoadingState({ type = "Standard" }: { type?: string }) {
  return (
    <Html
      fullscreen
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#1A1A1A",
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "3px solid #FFD700",
            borderTopColor: "transparent",
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ fontWeight: 600, fontSize: "14px" }}>Loading {type} bike...</p>
      </div>
    </Html>
  );
}