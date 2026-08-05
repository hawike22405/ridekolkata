import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

interface Chart3DProps {
  data: { name: string; value: number }[];
  className?: string;
  type?: "bar" | "line" | "area";
  color?: string;
  height?: number;
}

interface Bar3DProps {
  name: string;
  value: number;
  maxValue: number;
  index: number;
  total: number;
  color: string;
  width: number;
  depth: number;
  animated: boolean;
  onHover?: (name: string, value: number) => void;
  onLeave?: () => void;
}

function Bar3D({
  name,
  value,
  maxValue,
  index,
  total,
  color,
  width,
  depth,
  animated,
  onHover,
  onLeave,
}: Bar3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const height = maxValue > 0 ? (value / maxValue) * 4 : 0;
  const targetHeight = height;
  const x = (index - (total - 1) / 2) * (width * 1.5);

  useFrame(() => {
    if (meshRef.current && animated) {
      meshRef.current.scale.y = THREE.MathUtils.lerp(
        meshRef.current.scale.y,
        targetHeight / 0.5,
        0.1
      );
      meshRef.current.position.y = meshRef.current.scale.y * 0.25;
    }
  });

  return (
    <group
      onPointerOver={() => { setHovered(true); onHover?.(name, value); }}
      onPointerOut={() => { setHovered(false); onLeave?.(); }}
    >
      <mesh
        ref={meshRef}
        position={[x, height / 2, 0]}
        scale={[1, 0.01, 1]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, 0.5, depth]} />
        <meshStandardMaterial
          color={color}
          metalness={hovered ? 0.3 : 0.1}
          roughness={hovered ? 0.3 : 0.5}
          emissive={hovered ? color : "#000000"}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Top glow */}
      <mesh
        position={[x, height + 0.05, 0]}
        scale={[1.1, 0.02, 1.1]}
        opacity={hovered ? 0.5 : 0.2}
      >
        <boxGeometry args={[width, 0.1, depth]} />
        <meshBasicMaterial
          color={color}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Label */}
      <Html
        position={[x, -0.8, 0]}
        style={{
          textAlign: "center",
          color: "#1A1A1A",
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: "12px",
          fontWeight: 600,
          whiteSpace: "nowrap",
          transform: "rotateX(-15deg)",
        }}
      >
        {name}
      </Html>

      {/* Value on hover */}
      {hovered && (
        <Html
          position={[x, height + 0.8, 0]}
          style={{
            textAlign: "center",
            color: color,
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "18px",
            fontWeight: 700,
            whiteSpace: "nowrap",
            textShadow: `0 0 10px ${color}`,
          }}
        >
          {value}
        </Html>
      )}
    </group>
  );
}

function Line3D({
  data,
  maxValue,
  color,
  width,
  animated,
}: {
  data: { name: string; value: number }[];
  maxValue: number;
  color: string;
  width: number;
  animated: boolean;
}) {
  const points = useMemo(() => {
    return data.map((d, i) => {
      const x = (i - (data.length - 1) / 2) * (width * 1.5);
      const y = maxValue > 0 ? (d.value / maxValue) * 4 : 0;
      return new THREE.Vector3(x, y, 0);
    });
  }, [data, maxValue, width]);

  const lineRef = useRef<THREE.Line>(null);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  useFrame(() => {
    if (lineRef.current && animated) {
      // Subtle pulse animation
      const time = performance.now() * 0.001;
      lineRef.current.material.opacity = 0.8 + Math.sin(time * 2) * 0.2;
    }
  });

  return (
    <group>
      {/* Area fill */}
      <mesh>
        <shapeGeometry args={[]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Line */}
      <line
        ref={lineRef}
        geometry={geometry}
        castShadow
      >
        <lineMaterial
          color={color}
          linewidth={4}
          dashed={false}
          transparent
          opacity={0.9}
          resolution={1}
        />
      </line>

      {/* Data points */}
      {data.map((d, i) => {
        const x = (i - (data.length - 1) / 2) * (width * 1.5);
        const y = maxValue > 0 ? (d.value / maxValue) * 4 : 0;
        return (
          <mesh
            key={i}
            position={[x, y, 0]}
            castShadow
            onPointerOver={(e) => { e.stopPropagation(); }}
          >
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

function GridLines({ maxValue, width, total }: { maxValue: number; width: number; total: number }) {
  const lines = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= 4; i++) {
      const y = (i / 4) * 4;
      const value = Math.round((i / 4) * maxValue);
      arr.push({ y, value });
    }
    return arr;
  }, [maxValue]);

  return (
    <group>
      {lines.map(({ y, value }) => (
        <group key={value}>
          {/* Grid line */}
          <mesh position={[0, y, -0.1]}>
            <planeGeometry args={[total * width * 1.5, 0.02]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.05} depthWrite={false} />
          </mesh>
          {/* Y-axis label */}
          <Html
            position={[-(total * width * 1.5) / 2 - 0.8, y, 0]}
            style={{
              textAlign: "right",
              color: "#666",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </Html>
        </group>
      ))}
    </group>
  );
}

function Chart3DContent({
  data,
  type = "bar",
  color = "#FFD700",
}: Chart3DProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const total = data.length;
  const width = 0.6;
  const depth = 0.6;
  const [animated, setAnimated] = useState(false);
  const [hoveredData, setHoveredData] = useState<{ name: string; value: number } | null>(null);

  useFrame(() => {
    setAnimated(true);
  });

  return (
    <group>
      <GridLines maxValue={maxValue} width={width} total={total} />

      {type === "bar" && data.map((d, i) => (
        <Bar3D
          key={i}
          name={d.name}
          value={d.value}
          maxValue={maxValue}
          index={i}
          total={total}
          color={color}
          width={width}
          depth={depth}
          animated={animated}
          onHover={setHoveredData}
          onLeave={() => setHoveredData(null)}
        />
      ))}

      {type === "line" && (
        <Line3D data={data} maxValue={maxValue} color={color} width={width} animated={animated} />
      )}

      {/* X-axis baseline */}
      <mesh position={[0, 0, -0.05]} receiveShadow>
        <planeGeometry args={[total * width * 1.5, 0.04]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.1} depthWrite={false} />
      </mesh>

      {/* Tooltip */}
      {hoveredData && (
        <Html
          position={[0, 5, 0]}
          style={{
            position: "fixed",
            pointerEvents: "none",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "rgba(26, 26, 26, 0.95)",
              color: "#FFD700",
              padding: "8px 16px",
              borderRadius: "12px",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255, 215, 0, 0.3)",
              backdropFilter: "blur(10px)",
            }}
          >
            {hoveredData.name}: {hoveredData.value}
          </div>
        </Html>
      )}
    </group>
  );
}

function LightingRig() {
  return (
    <>
      <ambientLight intensity={0.7} color="#FFF8E7" />
      <directionalLight
        position={[5, 10, 7]}
        intensity={1.5}
        color="#FFFDE7"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#FFE082" />
      <hemisphereLight groundColor="#F5F5F5" skyColor="#FFFDE7" intensity={0.4} />
    </>
  );
}

function GroundPlane({ total, width }: { total: number; width: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[total * width * 1.5 + 2, 6]} />
      <meshStandardMaterial color="#F5F5F5" roughness={0.9} metalness={0} />
    </mesh>
  );
}

function Chart3DScene({ data, type, color }: Chart3DProps) {
  const total = data.length;
  const width = 0.6;

  return (
    <>
      <LightingRig />
      <GroundPlane total={total} width={width} />
      <Chart3DContent data={data} type={type} color={color} />
    </>
  );
}

export function Chart3D({
  data,
  className = "",
  type = "bar",
  color = "#FFD700",
  height = 400,
}: Chart3DProps) {
  return (
    <div className={className} style={{ width: "100%", height: height, minHeight: "300px" }}>
      <Canvas
        camera={{ position: [0, 3, 8], fov: 35 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        style={{ outline: "none" }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={<LoadingState />}>
          <Chart3DScene data={data} type={type} color={color} />
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
            width: "40px",
            height: "40px",
            border: "3px solid #FFD700",
            borderTopColor: "transparent",
            borderRadius: "50%",
            margin: "0 auto 12px",
            animation: "spin 1s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ fontWeight: 500 }}>Rendering chart...</p>
      </div>
    </Html>
  );
}