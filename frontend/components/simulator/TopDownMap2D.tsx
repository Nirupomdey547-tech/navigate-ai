"use client";

import React, { useMemo } from "react";
import { Compass } from "lucide-react";

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

  const traveledPolyline = useMemo(() => {
    return pathTraveled
      .map((nid) => {
        const nd = nodeMap.get(nid);
        return nd ? `${toSvgX(nd.position[0])},${toSvgY(nd.position[2])}` : null;
      })
      .filter(Boolean)
      .join(" ");
  }, [pathTraveled, nodeMap, minX, minZ]);

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
    <div className="w-full h-full relative bg-black flex flex-col items-center justify-center p-6 overflow-auto select-none">
      <div className="relative liquid-glass-elevated p-6 rounded-3xl">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          {/* Subtle Grid Pattern */}
          <defs>
            <pattern id="grid2d" width="28" height="28" patternUnits="userSpaceOnUse">
              <path
                d="M 28 0 L 0 0 0 28"
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid2d)" rx="16" />

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
                stroke="#27272A"
                strokeWidth="2.0"
                strokeLinecap="round"
              />
            );
          })}

          {/* Reference Path (Dashed Silver) */}
          {refPolyline && (
            <polyline
              points={refPolyline}
              fill="none"
              stroke="#71717A"
              strokeWidth="1.8"
              strokeDasharray="4 4"
              opacity="0.5"
            />
          )}

          {/* Traveled Path (Solid Glowing White) */}
          {traveledPolyline && (
            <polyline
              points={traveledPolyline}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            />
          )}

          {/* Node Cards */}
          {nodes.map((n) => {
            const cx = toSvgX(n.position[0]);
            const cy = toSvgY(n.position[2]);
            const isCurrent = n.id === currentNodeId;
            const isGoal = n.id === goalNodeId;
            const isWaypoint = n.id === targetWaypoint;

            let borderColor = "rgba(255, 255, 255, 0.1)";
            let bgColor = "rgba(18, 18, 22, 0.85)";

            if (isCurrent) {
              borderColor = "#FFFFFF";
              bgColor = "#27272A";
            } else if (isGoal) {
              borderColor = "#E4E4E7";
              bgColor = "#18181B";
            } else if (isWaypoint) {
              borderColor = "#A1A1AA";
              bgColor = "#18181B";
            }

            return (
              <g
                key={n.id}
                onClick={() => onSelectNode?.(n.id)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <rect
                  x={cx - 38}
                  y={cy - 22}
                  width="76"
                  height="44"
                  rx="10"
                  fill={bgColor}
                  stroke={borderColor}
                  strokeWidth={isCurrent ? "2.2" : "1.2"}
                  className="transition-colors"
                />

                <text
                  x={cx}
                  y={cy - 4}
                  textAnchor="middle"
                  fill={isCurrent ? "#FFFFFF" : "#E4E4E7"}
                  fontSize="10"
                  fontWeight={isCurrent ? "700" : "500"}
                  fontFamily="Inter, sans-serif"
                >
                  {n.room_type.length > 12 ? n.room_type.slice(0, 10) + "…" : n.room_type}
                </text>

                <text
                  x={cx}
                  y={cy + 10}
                  textAnchor="middle"
                  fill="#71717A"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {n.id}
                </text>

                {isGoal && (
                  <circle
                    cx={cx + 30}
                    cy={cy - 14}
                    r="4"
                    fill="#FFFFFF"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}

          {/* Agent Heading & Position Marker */}
          <g transform={`translate(${agentX}, ${agentY})`}>
            <circle
              r="18"
              fill="rgba(255, 255, 255, 0.12)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              className="animate-pulse"
            />
            <circle r="8" fill="#FFFFFF" />
            <g transform={`rotate(${currentHeading})`}>
              <polygon
                points="0,-16 -6,-6 6,-6"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth="1"
              />
            </g>
          </g>
        </svg>

        {/* 2D HUD Legend */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              <span className="text-white font-medium">Agent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-white/60 bg-white/20" />
              <span>Goal Destination</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>Reference</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-xs">
            <Compass className="w-3.5 h-3.5 opacity-80" />
            <span>{Math.round(currentHeading)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
}
