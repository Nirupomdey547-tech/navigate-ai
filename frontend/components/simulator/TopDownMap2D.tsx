"use client";

import React, { useMemo } from "react";
import { Compass, Target, MapPin } from "lucide-react";

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

interface TopDownMap2DProps {
  nodes: NodeData[];
  edges: EdgeData[];
  currentNodeId: string;
  currentHeading: number;
  pathTraveled: string[];
  referencePath?: string[];
  goalNodeId?: string;
  targetWaypoint?: string;
  onSelectNode?: (nodeId: string) => void;
}

export default function TopDownMap2D({
  nodes,
  edges,
  currentNodeId,
  currentHeading,
  pathTraveled,
  referencePath = [],
  goalNodeId,
  targetWaypoint,
  onSelectNode,
}: TopDownMap2DProps) {
  // Compute bounding box of node positions
  const { minX, maxX, minZ, maxZ } = useMemo(() => {
    let minX = -10, maxX = 10, minZ = -5, maxZ = 20;
    if (nodes.length > 0) {
      minX = Math.min(...nodes.map((n) => n.position[0])) - 4;
      maxX = Math.max(...nodes.map((n) => n.position[0])) + 4;
      minZ = Math.min(...nodes.map((n) => n.position[2])) - 4;
      maxZ = Math.max(...nodes.map((n) => n.position[2])) + 4;
    }
    return { minX, maxX, minZ, maxZ };
  }, [nodes]);

  // Coordinate mapping function to SVG coordinates
  const scale = 28;
  const width = Math.max(500, (maxX - minX) * scale);
  const height = Math.max(500, (maxZ - minZ) * scale);

  const toSvgX = (x: number) => (x - minX) * scale;
  const toSvgY = (z: number) => (z - minZ) * scale;

  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeData>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const currentNode = nodeMap.get(currentNodeId) || nodes[0];
  const agentX = currentNode ? toSvgX(currentNode.position[0]) : 250;
  const agentY = currentNode ? toSvgY(currentNode.position[2]) : 250;

  // Build traveled polyline path
  const traveledPolyline = useMemo(() => {
    return pathTraveled
      .map((nid) => {
        const nd = nodeMap.get(nid);
        return nd ? `${toSvgX(nd.position[0])},${toSvgY(nd.position[2])}` : null;
      })
      .filter(Boolean)
      .join(" ");
  }, [pathTraveled, nodeMap, minX, minZ]);

  // Build reference polyline path
  const refPolyline = useMemo(() => {
    return referencePath
      .map((nid) => {
        const nd = nodeMap.get(nid);
        return nd ? `${toSvgX(nd.position[0])},${toSvgY(nd.position[2])}` : null;
      })
      .filter(Boolean)
      .join(" ");
  }, [referencePath, nodeMap, minX, minZ]);

  return (
    <div className="w-full h-full relative bg-[#070A0D] flex flex-col items-center justify-center p-4 overflow-auto select-none">
      <div className="relative border border-white/10 rounded-2xl bg-[#0A0D10]/90 backdrop-blur-xl p-4 shadow-2xl">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          {/* Subtle Background Grid Pattern */}
          <defs>
            <pattern id="grid2d" width="28" height="28" patternUnits="userSpaceOnUse">
              <path
                d="M 28 0 L 0 0 0 28"
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid2d)" />

          {/* Graph Edges */}
          {edges.map((e, idx) => {
            const src = nodeMap.get(e.source);
            const tgt = nodeMap.get(e.target);
            if (!src || !tgt) return null;
            const x1 = toSvgX(src.position[0]);
            const y1 = toSvgY(src.position[2]);
            const x2 = toSvgX(tgt.position[0]);
            const y2 = toSvgY(tgt.position[2]);
            return (
              <line
                key={`edge-2d-${idx}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#1F2937"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* Reference Shortest Path (Dashed Blue) */}
          {refPolyline && (
            <polyline
              points={refPolyline}
              fill="none"
              stroke="#82B9FF"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.6"
            />
          )}

          {/* Traveled Path (Solid Teal Glow) */}
          {traveledPolyline && (
            <polyline
              points={traveledPolyline}
              fill="none"
              stroke="#63E6D1"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          )}

          {/* Render All Node Boxes & Labels */}
          {nodes.map((n) => {
            const cx = toSvgX(n.position[0]);
            const cy = toSvgY(n.position[2]);
            const isCurrent = n.id === currentNodeId;
            const isGoal = n.id === goalNodeId;
            const isWaypoint = n.id === targetWaypoint;

            let borderColor = "#374151";
            let bgColor = "#10161B";
            if (isCurrent) {
              borderColor = "#63E6D1";
              bgColor = "#0F2823";
            } else if (isGoal) {
              borderColor = "#FF7777";
              bgColor = "#281216";
            } else if (isWaypoint) {
              borderColor = "#F5C66B";
              bgColor = "#262013";
            }

            return (
              <g
                key={n.id}
                onClick={() => onSelectNode?.(n.id)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                {/* Node Boundary */}
                <rect
                  x={cx - 36}
                  y={cy - 22}
                  width="72"
                  height="44"
                  rx="8"
                  fill={bgColor}
                  stroke={borderColor}
                  strokeWidth={isCurrent ? "2.5" : "1.5"}
                  className="transition-colors"
                />

                {/* Node ID / Type Text */}
                <text
                  x={cx}
                  y={cy - 4}
                  textAnchor="middle"
                  fill={isCurrent ? "#63E6D1" : "#F4F7F8"}
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {n.room_type.length > 12 ? n.room_type.slice(0, 10) + "…" : n.room_type}
                </text>

                <text
                  x={cx}
                  y={cy + 10}
                  textAnchor="middle"
                  fill="#929DA5"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {n.id}
                </text>

                {/* Landmark Indicator Icon */}
                {isGoal && (
                  <circle
                    cx={cx + 28}
                    cy={cy - 14}
                    r="4"
                    fill="#FF7777"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}

          {/* Agent Heading & Direction Marker */}
          <g transform={`translate(${agentX}, ${agentY})`}>
            {/* Outer Pulsing Ring */}
            <circle
              r="18"
              fill="rgba(99, 230, 209, 0.15)"
              stroke="#63E6D1"
              strokeWidth="1.5"
              className="animate-pulse"
            />
            {/* Center Robot Beacon */}
            <circle r="9" fill="#63E6D1" />
            {/* Heading Arrow Pointer */}
            <g transform={`rotate(${currentHeading})`}>
              <polygon
                points="0,-16 -6,-6 6,-6"
                fill="#82B9FF"
                stroke="#0A0D10"
                strokeWidth="1"
              />
            </g>
          </g>
        </svg>

        {/* 2D HUD Legend */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#929DA5]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#63E6D1]" />
              <span>Current Position</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7777]" />
              <span>Goal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5C66B]" />
              <span>Waypoint</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#63E6D1]">
            <Compass className="w-3.5 h-3.5" />
            <span className="font-mono">{Math.round(currentHeading)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
}
