'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

// --- Monochromatic Architectural Grid Floor ---
function GridFloor() {
  return (
    <gridHelper
      args={[26, 26, '#3F3F46', '#18181B']}
      position={[0, -1.5, 0]}
    />
  );
}

// 3D Node positions in space
const NODE_POSITIONS: [number, number, number][] = [
  [-3.2, 0, -3.2],
  [0, 0, -3.2],
  [3.2, 0, -3.2],
  [-3.2, 0, 0],
  [0, 0, 0],
  [3.2, 0, 0],
  [-3.2, 0, 3.2],
  [0, 0, 3.2],
  [3.2, 0, 3.2],
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2],
  [3, 4], [4, 5],
  [6, 7], [7, 8],
  [0, 3], [3, 6],
  [1, 4], [4, 7],
  [2, 5], [5, 8],
];

const AGENT_PATH = [0, 1, 4, 7, 8];

function NavigationNode({ position, index }: { position: [number, number, number]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7 + index * 0.6) * 0.06;
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.13, 24, 24]} />
      <meshStandardMaterial
        color="#FFFFFF"
        emissive="#FFFFFF"
        emissiveIntensity={1.2}
        roughness={0.1}
        metalness={0.9}
      />
    </mesh>
  );
}

function EdgeLines() {
  return (
    <>
      {EDGES.map(([a, b], i) => (
        <Line
          key={i}
          points={[NODE_POSITIONS[a], NODE_POSITIONS[b]]}
          color="#A1A1AA"
          lineWidth={0.7}
          opacity={0.25}
          transparent
        />
      ))}
    </>
  );
}

function AgentBeacon() {
  const meshRef = useRef<THREE.Group>(null);
  const tRef = useRef(0);

  useFrame((_, delta) => {
    tRef.current += delta * 0.35;
    const total = AGENT_PATH.length - 1;
    const looped = tRef.current % total;
    const seg = Math.floor(looped);
    const frac = looped - seg;
    const from = NODE_POSITIONS[AGENT_PATH[seg]];
    const to = NODE_POSITIONS[AGENT_PATH[(seg + 1) % AGENT_PATH.length]];

    if (meshRef.current) {
      meshRef.current.position.set(
        THREE.MathUtils.lerp(from[0], to[0], frac),
        THREE.MathUtils.lerp(from[1], to[1], frac) + 0.28 + Math.sin(tRef.current * 2) * 0.04,
        THREE.MathUtils.lerp(from[2], to[2], frac),
      );
    }
  });

  return (
    <group ref={meshRef}>
      {/* Outer specular ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.26, 0.32, 32]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner glowing sphere */}
      <mesh>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={2.5}
          roughness={0.05}
          metalness={0.95}
        />
      </mesh>
    </group>
  );
}

function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.06;
    state.camera.position.set(Math.cos(t) * 11, 5, Math.sin(t) * 11);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.4} color="#FFFFFF" />
      <pointLight position={[0, 8, 0]} intensity={2.0} color="#FFFFFF" distance={25} />
      <pointLight position={[-6, 4, -6]} intensity={1.0} color="#D4D4D8" distance={20} />
      <GridFloor />
      {NODE_POSITIONS.map((pos, i) => (
        <NavigationNode key={i} position={pos} index={i} />
      ))}
      <EdgeLines />
      <AgentBeacon />
      <CameraRig />
    </>
  );
}

function FallbackScene() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-64 h-64 border border-white/10 rounded-full flex items-center justify-center animate-pulse">
        <div className="w-32 h-32 border border-white/20 rounded-full" />
      </div>
    </div>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-full">
      <Suspense fallback={<FallbackScene />}>
        <Canvas
          camera={{ position: [11, 5, 11], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Scene3D />
        </Canvas>
      </Suspense>
    </div>
  );
}
