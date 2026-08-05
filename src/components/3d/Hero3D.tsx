import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Environment, PerspectiveCamera } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Bike, MapPin, Zap, Star } from "lucide-react";

interface Hero3DProps {
  className?: string;
}

function FloatingBike() {
  const groupRef = useRef<THREE.Group>(null);
  const config = {
    frameColor: "#1A1A1A",
    accentColor: "#FFD700",
    wheelColor: "#333333",
    tireColor: "#111111",
  };

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.position.y = Math.sin(performance.now() * 0.001) * 0.3;
    }
  });

  return (
    <group ref={groupRef} scale={1.5}>
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
        <mesh castShadow receiveShadow>
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
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
          <meshStandardMaterial color={config.accentColor} metalness={0.8} roughness={0.1} />
        </mesh>
      </group>

      {/* Rear wheel */}
      <group position={[1.0, -0.5, 0]}>
        <mesh castShadow receiveShadow>
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
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.15, 16]} />
          <meshStandardMaterial color={config.accentColor} metalness={0.8} roughness={0.1} />
        </mesh>
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

      {/* Accent details - head badge */}
      <mesh position={[-1.0, 1.0, 0]} castShadow receiveShadow>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color={config.accentColor} side={THREE.DoubleSide} metalness={0.9} roughness={0.05} />
      </mesh>
    </group>
  );
}

function ParticleField({ count = 500 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 30;
      arr[i + 1] = (Math.random() - 0.5) * 30;
      arr[i + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, [count]);

  const sizes = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = Math.random() * 0.15 + 0.02;
    }
    return arr;
  }, [count]);

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const color1 = new THREE.Color("#FFD700");
    const color2 = new THREE.Color("#FF4500");
    const color3 = new THREE.Color("#FFFFFF");
    for (let i = 0; i < count; i++) {
      const c = Math.random() < 0.5 ? color1 : Math.random() < 0.75 ? color2 : color3;
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, sizes, colors]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

function OrbitingIcons() {
  const icons = [
    { component: Bike, color: "#FFD700", radius: 5, speed: 0.15, angleOffset: 0 },
    { component: MapPin, color: "#FF4500", radius: 6, speed: -0.12, angleOffset: Math.PI / 2 },
    { component: Zap, color: "#00D4FF", radius: 5.5, speed: 0.18, angleOffset: Math.PI },
    { component: Star, color: "#FFFFFF", radius: 4.5, speed: -0.1, angleOffset: (3 * Math.PI) / 2 },
  ];

  return (
    <group>
      {icons.map((icon, i) => (
        <OrbitingIcon key={i} {...icon} />
      ))}
    </group>
  );
}

interface OrbitingIconProps {
  component: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  radius: number;
  speed: number;
  angleOffset: number;
}

function OrbitingIcon({ component: Icon, color, radius, speed, angleOffset }: OrbitingIconProps) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (ref.current) {
      const time = performance.now() * 0.001;
      const angle = time * speed + angleOffset;
      ref.current.position.x = Math.cos(angle) * radius;
      ref.current.position.z = Math.sin(angle) * radius;
      ref.current.position.y = Math.sin(time * 1.5 + angleOffset) * 0.5;
      ref.current.lookAt(0, 0, 0);
      ref.current.rotation.z = Math.PI;
    }
  });

  return (
    <group
      ref={ref}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Html
        transform
        style={{
          filter: `drop-shadow(0 0 20px ${color})`,
          transition: "transform 0.3s ease, filter 0.3s ease",
          transform: hovered ? "scale(1.5)" : "scale(1)",
        }}
      >
        <Icon size={hovered ? 32 : 24} color={color} />
      </Html>
      {/* Glow ring */}
      <mesh
        position={[0, 0, -0.1]}
        scale={hovered ? 1.5 : 1}
        onClick={() => {}}
      >
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.4 : 0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function GroundPlane() {
  return (
    <>
      {/* Main ground with shadow catcher */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <circleGeometry args={[20, 64]} />
        <meshStandardMaterial
          color="#F5F5F5"
          transparent
          opacity={0}
          shadowSide={THREE.BackSide}
        />
      </mesh>

      {/* Gradient rings on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.95, 0]}>
        <ringGeometry args={[0, 8, 64]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.95, 0]}>
        <ringGeometry args={[8, 15, 64]} />
        <meshBasicMaterial
          color="#FF4500"
          transparent
          opacity={0.02}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function LightingRig() {
  return (
    <>
      <ambientLight intensity={0.6} color="#FFF8E7" />

      {/* Key light */}
      <directionalLight
        position={[8, 15, 10]}
        intensity={2.5}
        color="#FFFDE7"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0001}
        shadow-normalBias={0.1}
      />

      {/* Fill light - warm from left */}
      <directionalLight position={[-10, 8, -5]} intensity={1} color="#FFE082" />

      {/* Rim light - cool from behind */}
      <directionalLight position={[0, 5, -10]} intensity={0.8} color="#E3F2FD" />

      {/* Accent lights */}
      <pointLight position={[5, 5, 5]} intensity={1} color="#FFD700" decay={2} distance={20} />
      <pointLight position={[-5, 3, -5]} intensity={0.6} color="#FF4500" decay={2} distance={20} />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#FFFFFF" decay={2} distance={30} />

      <hemisphereLight groundColor="#F5F5F5" skyColor="#FFFDE7" intensity={0.4} />
    </>
  );
}

function HeroScene() {
  return (
    <>
      <Environment
        preset="city"
        background={false}
        ground={false}
      />

      <LightingRig />
      <GroundPlane />
      <ParticleField count={800} />
      <OrbitingIcons />

      {/* Main floating bike */}
      <group position={[0, 0, 0]}>
        <FloatingBike />
      </group>

      {/* Secondary smaller bikes in background */}
      <group position={[-6, -1, -8]} scale={0.6} rotation={[0, -0.5, 0]}>
        <FloatingBike />
      </group>
      <group position={[6, -1.5, -10]} scale={0.5} rotation={[0, 0.8, 0]}>
        <FloatingBike />
      </group>
    </>
  );
}

export function Hero3D({ className = "" }: Hero3DProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 1, 12], fov: 45 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        style={{ outline: "none" }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={<LoadingOverlay />}>
          <HeroScene />
        </Suspense>
      </Canvas>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <Html fullscreen style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F5F5" }}>
      <div style={{ textAlign: "center", color: "#1A1A1A", fontFamily: "Space Grotesk, sans-serif" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid #FFD700",
            borderTopColor: "transparent",
            borderRadius: "50%",
            margin: "0 auto 20px",
            animation: "spin 1s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>RIDE KOLKATA</h2>
        <p style={{ color: "#666" }}>Loading 3D experience...</p>
      </div>
    </Html>
  );
}