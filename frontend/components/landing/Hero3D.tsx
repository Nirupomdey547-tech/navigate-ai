'use client';

import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// --- Grid Floor ---
function GridFloor() {
  return (
    <gridHelper
      args={[24, 24, '#63E6D1', '#1a2a30']}
      position={[0, -1.5, 0]}
    />
  );
}

// Node positions for the navigation graph
const NODE_POSITIONS: [number, number, number][] = [
  [-3, 0, -3],
  [0, 0, -3],
  [3, 0, -3],
  [-3, 0, 0],
  [0, 0, 0],
  [3, 0, 0],
  [-3, 0, 3],
  [0, 0, 3],
  [3, 0, 3],
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2],
  [3, 4], [4, 5],
  [6, 7], [7, 8],
  [0, 3], [3, 6],
  [1, 4], [4, 7],
  [2, 5], [5, 8],
];

// Path the agent follows (indices into NODE_POSITIONS)
const AGENT_PATH = [0, 1, 4, 7, 8];

function NavigationNode({ position, index }: { position: [number, number, number]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8 + index * 0.7) * 0.08;
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial
        color="#63E6D1"
        emissive="#63E6D1"
        emissiveIntensity={1.2}
        roughness={0.1}
        metalness={0.8}
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
          color="#82B9FF"
          lineWidth={0.8}
          opacity={0.35}
          transparent
        />
      ))}
    </>
  );
}

function AgentSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(0);

  useFrame((_, delta) => {
    tRef.current += delta * 0.3;
    const total = AGENT_PATH.length - 1;
    const looped = tRef.current % total;
    const seg = Math.floor(looped);
    const frac = looped - seg;
    const from = NODE_POSITIONS[AGENT_PATH[seg]];
    const to = NODE_POSITIONS[AGENT_PATH[(seg + 1) % AGENT_PATH.length]];

    if (meshRef.current) {
      meshRef.current.position.set(
        THREE.MathUtils.lerp(from[0], to[0], frac),
        THREE.MathUtils.lerp(from[1], to[1], frac) + 0.25 + Math.sin(tRef.current * 2) * 0.05,
        THREE.MathUtils.lerp(from[2], to[2], frac),
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.2, 20, 20]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFD700"
        emissiveIntensity={2.5}
        roughness={0.05}
        metalness={0.9}
      />
    </mesh>
  );
}

function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.08;
    state.camera.position.set(Math.cos(t) * 11, 5, Math.sin(t) * 11);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.3} color="#82B9FF" />
      <pointLight position={[0, 6, 0]} intensity={1.8} color="#63E6D1" distance={20} />
      <pointLight position={[-5, 3, -5]} intensity={0.8} color="#82B9FF" distance={15} />
      <GridFloor />
      {NODE_POSITIONS.map((pos, i) => (
        <NavigationNode key={i} position={pos} index={i} />
      ))}
      <EdgeLines />
      <AgentSphere />
      <CameraRig />
    </>
  );
}

function FallbackScene() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-72 h-72">
        {/* 2D grid fallback */}
        <svg viewBox="0 0 300 300" className="w-full h-full opacity-50">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#63E6D1" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="300" height="300" fill="url(#grid)" />
          {[60, 150, 240].map((x) =>
            [60, 150, 240].map((y) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="6" fill="#63E6D1" opacity="0.8" />
            ))
          )}
        </svg>
      </div>
    </div>
  );
}

function CanvasErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<FallbackScene />}>
      {children}
    </Suspense>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-full">
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [11, 5, 11], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Scene3D />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
