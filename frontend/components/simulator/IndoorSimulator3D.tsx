"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";

interface NodeData {
  id: string;
  position: [number, number, number];
  room_type: string;
  landmarks: string[];
}

interface EdgeData {
  source: string;
  target: string;
  direction?: string;
}

interface IndoorSimulator3DProps {
  nodes: NodeData[];
  edges: EdgeData[];
  currentNodeId: string;
  currentHeading: number;
  pathTraveled: string[];
  referencePath?: string[];
  goalNodeId?: string;
  targetWaypoint?: string;
  cameraMode?: "perspective" | "top_down" | "follow";
}

// ---------------------------------------------------------------------------
// Room Volume & Architectural Platform
// ---------------------------------------------------------------------------
function RoomPlatform({
  node,
  isCurrent,
  isGoal,
  isWaypoint,
}: {
  node: NodeData;
  isCurrent: boolean;
  isGoal: boolean;
  isWaypoint: boolean;
}) {
  const [x, y, z] = node.position;

  return (
    <group position={[x, y, z]}>
      {/* Floor Pad */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[2.2, 0.1, 2.2]} />
        <meshStandardMaterial
          color={isCurrent ? "#27272A" : "#09090B"}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Perimeter Specular Ring */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.15, 32]} />
        <meshBasicMaterial
          color={isCurrent ? "#FFFFFF" : isGoal ? "#E4E4E7" : "#3F3F46"}
          transparent
          opacity={isCurrent ? 0.95 : isGoal ? 0.8 : 0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating Room Label */}
      <Billboard position={[0, 1.35, 0]}>
        <Text
          fontSize={0.22}
          color={isCurrent ? "#FFFFFF" : "#A1A1AA"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {node.room_type}
        </Text>
      </Billboard>

      {/* Landmark Markers */}
      {node.landmarks.slice(0, 2).map((lm, idx) => (
        <Billboard key={lm} position={[0, 1.05 - idx * 0.18, 0]}>
          <Text
            fontSize={0.13}
            color="#71717A"
            anchorX="center"
            anchorY="middle"
          >
            • {lm.replace(/_/g, " ")}
          </Text>
        </Billboard>
      ))}

      {/* Goal Specular Beacon Pillar */}
      {isGoal && (
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.8, 16]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={2.0}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Agent Mesh & Heading Indicator
// ---------------------------------------------------------------------------
function AgentMarker({
  currentPos,
  heading,
}: {
  currentPos: [number, number, number];
  heading: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(...currentPos));

  useEffect(() => {
    targetPos.current.set(currentPos[0], currentPos[1] + 0.32, currentPos[2]);
  }, [currentPos]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.lerp(targetPos.current, delta * 8);

      const rad = (-heading * Math.PI) / 180;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rad,
        delta * 6
      );
    }
  });

  return (
    <group ref={groupRef} position={[currentPos[0], currentPos[1] + 0.32, currentPos[2]]}>
      {/* Agent Body in Sleek Architectural Chrome / White */}
      <mesh>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={1.8}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Directional Beacon Pointer */}
      <mesh position={[0, 0, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.11, 0.34, 16]} />
        <meshStandardMaterial
          color="#E4E4E7"
          emissive="#E4E4E7"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Orbiting Specular Halo */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.46, 32]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Camera Controller with Mode Handling
// ---------------------------------------------------------------------------
function CameraRig({
  mode,
  agentPos,
}: {
  mode: "perspective" | "top_down" | "follow";
  agentPos: [number, number, number];
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (mode === "top_down") {
      camera.position.set(0, 26, 0.01);
      camera.lookAt(0, 0, 0);
    } else if (mode === "perspective") {
      camera.position.set(0, 18, 22);
      camera.lookAt(0, 0, 6);
    }
  }, [mode, camera]);

  useFrame(() => {
    if (mode === "follow") {
      const targetCam = new THREE.Vector3(
        agentPos[0],
        agentPos[1] + 7,
        agentPos[2] + 9
      );
      camera.position.lerp(targetCam, 0.05);
      camera.lookAt(agentPos[0], agentPos[1], agentPos[2]);
    }
  });

  return null;
}

// ---------------------------------------------------------------------------
// Main Indoor Simulator 3D Component
// ---------------------------------------------------------------------------
export default function IndoorSimulator3D({
  nodes,
  edges,
  currentNodeId,
  currentHeading,
  pathTraveled,
  referencePath = [],
  goalNodeId,
  targetWaypoint,
  cameraMode = "perspective",
}: IndoorSimulator3DProps) {
  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeData>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const currentNode = nodeMap.get(currentNodeId) || nodes[0];
  const currentPos: [number, number, number] = currentNode
    ? currentNode.position
    : [0, 0, 0];

  const traveledPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    pathTraveled.forEach((nid) => {
      const nd = nodeMap.get(nid);
      if (nd) pts.push([nd.position[0], nd.position[1] + 0.15, nd.position[2]]);
    });
    return pts;
  }, [pathTraveled, nodeMap]);

  const refPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    referencePath.forEach((nid) => {
      const nd = nodeMap.get(nid);
      if (nd) pts.push([nd.position[0], nd.position[1] + 0.08, nd.position[2]]);
    });
    return pts;
  }, [referencePath, nodeMap]);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 18, 22], fov: 46 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 15]} intensity={0.9} color="#FFFFFF" />
        <pointLight position={[0, 8, 0]} intensity={0.8} color="#FFFFFF" />

        {/* Global Architectural Grid */}
        <gridHelper args={[42, 42, "#27272A", "#121216"]} position={[0, -0.1, 6]} />

        {/* Render Graph Edges */}
        {edges.map((e, idx) => {
          const src = nodeMap.get(e.source);
          const tgt = nodeMap.get(e.target);
          if (!src || !tgt) return null;
          return (
            <Line
              key={`edge-${idx}`}
              points={[
                [src.position[0], src.position[1] + 0.05, src.position[2]],
                [tgt.position[0], tgt.position[1] + 0.05, tgt.position[2]],
              ]}
              color="#3F3F46"
              lineWidth={1.0}
              transparent
              opacity={0.35}
            />
          );
        })}

        {/* Reference Shortest Path (Subtle Silver Line) */}
        {refPoints.length >= 2 && (
          <Line
            points={refPoints}
            color="#71717A"
            lineWidth={2.0}
            transparent
            opacity={0.45}
          />
        )}

        {/* Traveled Glowing Path (Pure White) */}
        {traveledPoints.length >= 2 && (
          <Line
            points={traveledPoints}
            color="#FFFFFF"
            lineWidth={3.2}
          />
        )}

        {/* All Node Rooms */}
        {nodes.map((node) => (
          <RoomPlatform
            key={node.id}
            node={node}
            isCurrent={node.id === currentNodeId}
            isGoal={node.id === goalNodeId}
            isWaypoint={node.id === targetWaypoint}
          />
        ))}

        {/* Navigation Agent Beacon */}
        <AgentMarker currentPos={currentPos} heading={currentHeading} />

        {/* Camera Rig & Orbit Controls */}
        <CameraRig mode={cameraMode} agentPos={currentPos} />
        {cameraMode !== "follow" && (
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={4}
            maxDistance={50}
          />
        )}
      </Canvas>

      {/* Floating HUD Indicator Capsule */}
      <div className="absolute top-4 left-4 flex items-center gap-3 liquid-glass-elevated px-3.5 py-1.5 rounded-full text-[11px] text-zinc-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
          <span className="font-medium text-white">Agent</span>
        </div>
        <span className="text-white/15">/</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full border border-white/60 bg-white/20" />
          <span className="text-zinc-300">Destination</span>
        </div>
        <span className="text-white/15">/</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zinc-600" />
          <span className="text-zinc-400">Reference Route</span>
        </div>
      </div>
    </div>
  );
}
