"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import LiquidCard from "@/components/ui/LiquidCard";
import { getModels } from "@/lib/api";
import {
  Cpu,
  Globe2,
  CheckCircle2,
  Activity,
  Compass,
} from "lucide-react";

export default function ModelsPage() {
  const [modelData, setModelData] = useState<any>(null);

  useEffect(() => {
    getModels().then(setModelData).catch(console.error);
  }, []);

  const components = modelData?.components || {};
  const languages = modelData?.supported_languages || [];

  return (
    <AppShell>
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-black text-white">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/[0.08]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-subtle text-[11px] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                ARCHITECTURE REGISTRY
              </span>
              <span className="text-white/20">/</span>
              <span className="text-white font-medium">Model Telemetry</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              AI Models & Perception Pipelines
            </h1>
            <p className="text-sm text-zinc-400 font-light max-w-2xl">
              Inspect installed multilingual encoders, vision perception backbones, decision policy weights, and runtime execution hardware.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full liquid-glass-subtle text-xs font-mono text-zinc-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" />
              <span>Hardware: Standard CPU (Optimized NumPy/SciPy)</span>
            </span>
          </div>
        </div>

        {/* 4 Architecture Component Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Component 1: Multilingual Language Encoder */}
          <LiquidCard variant="default" className="p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">Multilingual Language Encoder</h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {components.language_encoder?.checkpoint || "MiniLM-L12-v2"}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-white/20 bg-white/5 text-white">
                Active
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Extracts spatial constraints, directional headings, landmark references, and sequential goal waypoints across Roman and Devanagari scripts.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
              <div className="bg-black/60 border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] text-zinc-500 block">Embedding Dim</span>
                <span className="text-white font-bold">{components.language_encoder?.embedding_dim || 384}</span>
              </div>
              <div className="bg-black/60 border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] text-zinc-500 block">Fallback Mode</span>
                <span className="text-white font-bold">TF-IDF N-Gram Matching</span>
              </div>
            </div>
          </LiquidCard>

          {/* Component 2: Vision-Language Perception */}
          <LiquidCard variant="default" className="p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">360° Visual Perception Engine</h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Multi-view Cosine Grounding
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-white/20 bg-white/5 text-white">
                Active
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Synthesizes 4 continuous panoramic observation angles ($0^\circ, 90^\circ, 180^\circ, 270^\circ$) and matches candidate views against target landmark embeddings.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
              <div className="bg-black/60 border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] text-zinc-500 block">Panoramic Views</span>
                <span className="text-white font-bold">4-Quadrant 360°</span>
              </div>
              <div className="bg-black/60 border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] text-zinc-500 block">Similarity Function</span>
                <span className="text-white font-bold">Cosine Metric</span>
              </div>
            </div>
          </LiquidCard>

          {/* Component 3: Instruction-Conditioned Decision Policy */}
          <LiquidCard variant="default" className="p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">Instruction-Conditioned Policy</h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Multi-Criteria Utility Scoring
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-white/20 bg-white/5 text-white">
                Active
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Balances linguistic alignment, landmark verification, geodesic path reduction toward target destination, and visited-node loop suppression penalties.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
              <div className="bg-black/60 border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] text-zinc-500 block">Path Planning</span>
                <span className="text-white font-bold">NetworkX Dijkstra</span>
              </div>
              <div className="bg-black/60 border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] text-zinc-500 block">Loop Penalty Weight</span>
                <span className="text-white font-bold">0.45 Exp</span>
              </div>
            </div>
          </LiquidCard>

          {/* Component 4: Uncertainty & Failure Detection */}
          <LiquidCard variant="default" className="p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">Calibrated Uncertainty Estimator</h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Shannon Entropy & Margin Ambiguity
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-white/20 bg-white/5 text-white">
                Active
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Monitors the softmax candidate score margin and observation entropy to trigger ambiguity warnings, replanning routines, or human intervention.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
              <div className="bg-black/60 border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] text-zinc-500 block">Ambiguity Metric</span>
                <span className="text-white font-bold">ΔP = P(a1) - P(a2)</span>
              </div>
              <div className="bg-black/60 border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] text-zinc-500 block">Entropy Scaling</span>
                <span className="text-white font-bold">Calibrated Softmax</span>
              </div>
            </div>
          </LiquidCard>

        </div>

      </div>
    </AppShell>
  );
}
