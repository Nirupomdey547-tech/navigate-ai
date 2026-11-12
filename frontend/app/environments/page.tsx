"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import TopDownMap2D from "@/components/simulator/TopDownMap2D";
import { getEnvironments, createEnvironment } from "@/lib/api";
import {
  Layers,
  MapPin,
  Compass,
  ArrowRight,
  Download,
  Upload,
  Plus,
  CheckCircle2,
  Sliders,
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
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#63E6D1]/10 text-[#63E6D1] border border-[#63E6D1]/20">
                ENVIRONMENT TOPOLOGIES
              </span>
              <span className="text-xs text-[#929DA5]">State-Space Navigation Graphs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Indoor Environmental Graphs
            </h1>
            <p className="text-sm text-[#929DA5] mt-1 max-w-2xl">
              Inspect 3D coordinates, room semantic categories, visible landmark distributions, and directed navigation connectivity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-[#82B9FF]" />
              <span>Export Graph JSON</span>
            </button>
          </div>
        </div>

        {/* 2-Column: Left Environment Explorer, Right 2D Map & Topology Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Environments List */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#929DA5] uppercase tracking-wider block">
              Available Environments ({environments.length})
            </span>

            <div className="space-y-2">
              {environments.map((env) => (
                <button
                  key={env.id}
                  onClick={() => setSelectedEnvId(env.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedEnvId === env.id
                      ? "bg-[#63E6D1]/10 border-[#63E6D1] shadow-lg shadow-[#63E6D1]/10"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-white">{env.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/80">
                      {env.nodes?.length || 0} nodes
                    </span>
                  </div>
                  <p className="text-xs text-[#929DA5] line-clamp-2 leading-relaxed">
                    {env.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Import Custom Graph JSON Section */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
              <span className="text-xs font-bold text-[#82B9FF] uppercase tracking-wider block flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Import Custom Environment Graph</span>
              </span>
              <p className="text-[11px] text-[#929DA5]">
                Paste a valid JSON environment graph definition with nodes and edges:
              </p>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={4}
                placeholder='{"name": "My Custom Floor", "nodes": [...], "edges": [...]}'
                className="w-full bg-[#10161B] border border-white/10 rounded-lg p-2 text-xs font-mono text-white/90 focus:outline-none focus:border-[#63E6D1] resize-none"
              />
              <button
                onClick={handleImportJson}
                disabled={!jsonInput.trim()}
                className="w-full py-2 rounded-lg bg-[#63E6D1]/20 hover:bg-[#63E6D1]/30 border border-[#63E6D1] text-[#63E6D1] text-xs font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Custom Graph</span>
              </button>
              {importStatus && (
                <p className="text-[10px] text-[#7EE2A8] font-mono">{importStatus}</p>
              )}
            </div>
          </div>

          {/* Right Topology Inspector & 2D Graph Map */}
          <div className="lg:col-span-2 space-y-6">
            {currentEnv && (
              <>
                {/* 2D Topological Preview Canvas */}
                <div className="h-96 rounded-2xl border border-white/[0.08] overflow-hidden relative">
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
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Nodes & Visible Landmarks ({currentEnv.nodes?.length || 0})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {currentEnv.nodes?.map((n: any) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-white">{n.room_type}</span>
                          <span className="font-mono text-[10px] text-[#63E6D1]">
                            [{n.position?.[0]}, {n.position?.[1]}, {n.position?.[2]}]
                          </span>
                        </div>
                        <p className="text-[11px] text-[#929DA5]">{n.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {n.landmarks?.map((lm: string) => (
                            <span
                              key={lm}
                              className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-[#82B9FF] font-mono"
                            >
                              {lm}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
