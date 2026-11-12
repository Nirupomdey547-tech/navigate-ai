"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import TopDownMap2D from "@/components/simulator/TopDownMap2D";
import LiquidCard from "@/components/ui/LiquidCard";
import { getEnvironments, createEnvironment } from "@/lib/api";
import {
  Layers,
  Download,
  Upload,
  Plus,
  CheckCircle2,
  Compass,
} from "lucide-react";

export default function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<any[]>([]);
  const [selectedEnvId, setSelectedEnvId] = useState<string>("office_floor");
  const [jsonInput, setJsonInput] = useState<string>("");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    getEnvironments().then((envs) => {
      setEnvironments(envs);
      if (envs.length > 0) {
        setSelectedEnvId(envs[0].id);
      }
    });
  }, []);

  const currentEnv = environments.find((e) => e.id === selectedEnvId);

  const handleExportJson = () => {
    if (!currentEnv) return;
    const blob = new Blob([JSON.stringify(currentEnv, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentEnv.id}_graph.json`;
    a.click();
  };

  const handleImportJson = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.name || !parsed.nodes || !parsed.edges) {
        throw new Error("Invalid graph JSON. Must contain 'name', 'nodes', and 'edges'.");
      }
      const created = await createEnvironment(parsed);
      setEnvironments((prev) => [...prev, created]);
      setSelectedEnvId(created.id);
      setImportStatus("Custom environment imported successfully!");
      setJsonInput("");
    } catch (err: any) {
      setImportStatus(`Import Error: ${err.message}`);
    }
  };

  return (
    <AppShell>
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-black text-white">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/[0.08]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-subtle text-[11px] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                GRAPH TOPOLOGIES
              </span>
              <span className="text-white/20">/</span>
              <span className="text-white font-medium">State-Space Navigation</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Indoor Environmental Graphs
            </h1>
            <p className="text-sm text-zinc-400 font-light max-w-2xl">
              Inspect 3D coordinates, room semantic categories, visible landmark distributions, and directed navigation connectivity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJson}
              className="px-5 py-2.5 rounded-xl text-xs font-medium liquid-glass-interactive text-zinc-200 hover:text-white flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 opacity-80" />
              <span>Export Graph JSON</span>
            </button>
          </div>
        </div>

        {/* 2-Column: Left Environment Explorer, Right 2D Map & Topology Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Environments List */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold block">
              Available Topologies ({environments.length})
            </span>

            <div className="space-y-2">
              {environments.map((env) => (
                <button
                  key={env.id}
                  onClick={() => setSelectedEnvId(env.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedEnvId === env.id
                      ? "liquid-glass-elevated border-white/30 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.2)]"
                      : "liquid-glass-subtle hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-sm font-semibold text-white tracking-tight">{env.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                      {env.nodes?.length || 0} nodes
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed">
                    {env.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Import Custom Graph JSON Section */}
            <LiquidCard variant="subtle" className="p-5 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold block flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Import Custom Graph</span>
              </span>
              <p className="text-xs text-zinc-400 font-light">
                Paste JSON graph with nodes and directed edges:
              </p>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={4}
                placeholder='{"name": "Custom Space", "nodes": [...], "edges": [...]}'
                className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-white/30 resize-none"
              />
              <button
                onClick={handleImportJson}
                disabled={!jsonInput.trim()}
                className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 disabled:opacity-30 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Custom Graph</span>
              </button>
              {importStatus && (
                <p className="text-[11px] text-zinc-300 font-mono">{importStatus}</p>
              )}
            </LiquidCard>
          </div>

          {/* Right Topology Inspector & 2D Graph Map */}
          <div className="lg:col-span-2 space-y-6">
            {currentEnv && (
              <>
                {/* 2D Topological Preview Canvas */}
                <div className="h-96 rounded-3xl liquid-glass-elevated overflow-hidden relative">
                  <TopDownMap2D
                    nodes={currentEnv.nodes || []}
                    edges={currentEnv.edges || []}
                    currentNodeId={currentEnv.start_node_id || currentEnv.nodes?.[0]?.id || ""}
                    currentHeading={0}
                    pathTraveled={[]}
                    goalNodeId={currentEnv.goal_node_ids?.[0]}
                  />
                </div>

                {/* Nodes & Landmarks Table */}
                <LiquidCard variant="subtle" className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <h3 className="text-sm font-semibold text-white tracking-tight">
                      Nodes & Grounded Landmarks ({currentEnv.nodes?.length || 0})
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      Topological Space
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {currentEnv.nodes?.map((n: any) => (
                      <div
                        key={n.id}
                        className="p-3.5 rounded-xl liquid-glass-subtle space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-white">{n.room_type}</span>
                          <span className="font-mono text-[10px] text-zinc-400">
                            [{n.position?.[0]}, {n.position?.[1]}, {n.position?.[2]}]
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-light">{n.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {n.landmarks?.map((lm: string) => (
                            <span
                              key={lm}
                              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-zinc-300 font-mono"
                            >
                              {lm}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </LiquidCard>
              </>
            )}
          </div>

        </div>

      </div>
    </AppShell>
  );
}
