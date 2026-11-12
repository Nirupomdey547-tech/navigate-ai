"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Sphere, Text, Billboard } from "@react-three/drei";
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
// Room Volume & Platform
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

  const color = useMemo(() => {
    if (isCurrent) return "#63E6D1";
    if (isGoal) return "#FF7777";
    if (isWaypoint) return "#F5C66B";
    return "#1F2937";
  }, [isCurrent, isGoal, isWaypoint]);

  return (
    <group position={[x, y, z]}>
      {/* Floor Pad */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[2.2, 0.1, 2.2]} />
        <meshStandardMaterial
          color={isCurrent ? "#163832" : "#10161B"}
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Perimeter Glow Edge */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.1, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isCurrent ? 0.9 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>


      {/* Floating Room Label */}
      <Billboard position={[0, 1.4, 0]}>
        <Text
          fontSize={0.24}
          color={isCurrent ? "#63E6D1" : "#F4F7F8"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#0A0D10"
        >
          {node.room_type}
        </Text>
      </Billboard>

      {/* Landmark Markers */}
      {node.landmarks.slice(0, 2).map((lm, idx) => (
        <Billboard key={lm} position={[0, 1.1 - idx * 0.18, 0]}>
          <Text
            fontSize={0.14}
            color="#929DA5"
            anchorX="center"
            anchorY="middle"
          >
            • {lm.replace(/_/g, " ")}
          </Text>
        </Billboard>
      ))}

      {/* Goal Pillar if destination */}
      {isGoal && (
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1.6, 16]} />
          <meshStandardMaterial
            color="#FF7777"
            emissive="#FF7777"
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
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
    targetPos.current.set(currentPos[0], currentPos[1] + 0.3, currentPos[2]);
  }, [currentPos]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Smooth lerp to position
      groupRef.current.position.lerp(targetPos.current, delta * 8);

      // Smooth heading rotation
      const rad = (-heading * Math.PI) / 180;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rad,
        delta * 6
      );
    }
  });

  return (
    <group ref={groupRef} position={[currentPos[0], currentPos[1] + 0.3, currentPos[2]]}>
      {/* Agent Body / Drone */}
      <mesh>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial
          color="#63E6D1"
          emissive="#63E6D1"
          emissiveIntensity={1.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Inner Core */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Directional Beacon / Cone pointer */}
      <mesh position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.35, 16]} />
        <meshStandardMaterial
          color="#82B9FF"
          emissive="#82B9FF"
          emissiveIntensity={1.8}
        />
      </mesh>

      {/* Orbiting Sensor Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.46, 32]} />
        <meshBasicMaterial color="#63E6D1" transparent opacity={0.6} side={THREE.DoubleSide} />
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
      camera.position.set(0, 28, 0.01);
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
  // Map node positions
  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeData>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Current node object
  const currentNode = nodeMap.get(currentNodeId) || nodes[0];
  const currentPos: [number, number, number] = currentNode
    ? currentNode.position
    : [0, 0, 0];

  // Completed path points for line drawing
  const traveledPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    pathTraveled.forEach((nid) => {
      const nd = nodeMap.get(nid);
      if (nd) pts.push([nd.position[0], nd.position[1] + 0.15, nd.position[2]]);
    });
    return pts;
  }, [pathTraveled, nodeMap]);

  // Reference shortest path points
  const refPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    referencePath.forEach((nid) => {
      const nd = nodeMap.get(nid);
      if (nd) pts.push([nd.position[0], nd.position[1] + 0.08, nd.position[2]]);
    });
    return pts;
  }, [referencePath, nodeMap]);

  return (
    <div className="w-full h-full relative bg-[#070A0D] overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 18, 22], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#070A0D"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 15]} intensity={0.8} />
        <pointLight position={[0, 8, 0]} intensity={0.6} color="#63E6D1" />

        {/* Global Grid Helper */}
        <gridHelper args={[40, 40, "#1F2937", "#111827"]} position={[0, -0.1, 6]} />

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
              color="#374151"
              lineWidth={1.2}
              transparent
              opacity={0.4}
            />
          );
        })}

        {/* Reference Shortest Path (dashed-style blue) */}
        {refPoints.length >= 2 && (
          <Line
            points={refPoints}
            color="#82B9FF"
            lineWidth={2.2}
            transparent
            opacity={0.5}
          />
        )}

        {/* Traveled Glowing Path (Teal) */}
        {traveledPoints.length >= 2 && (
          <Line
            points={traveledPoints}
            color="#63E6D1"
            lineWidth={3.5}
          />
        )}

        {/* Render All Node Rooms */}
        {nodes.map((node) => (
          <RoomPlatform
            key={node.id}
            node={node}
            isCurrent={node.id === currentNodeId}
            isGoal={node.id === goalNodeId}
            isWaypoint={node.id === targetWaypoint}
          />
        ))}

        {/* The Mobile Navigation Agent */}
        <AgentMarker currentPos={currentPos} heading={currentHeading} />

        {/* Camera Controller & Orbit */}
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

      {/* Floating 3D HUD Indicators */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#0A0D10]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] text-[#929DA5]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#63E6D1] shadow-[0_0_8px_#63E6D1]" />
          <span>Agent</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF7777] shadow-[0_0_8px_#FF7777]" />
          <span>Destination</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#82B9FF]" />
          <span>Shortest Path</span>
        </div>
      </div>
    </div>
  );
}
