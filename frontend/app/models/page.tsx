"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { getModels } from "@/lib/api";
import {
  Cpu,
  Layers,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  Sparkles,
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
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#63E6D1]/10 text-[#63E6D1] border border-[#63E6D1]/20">
                ARCHITECTURE REGISTRY
              </span>
              <span className="text-xs text-[#929DA5]">Integrated AI Models & Perception Layers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Models & Pipelines
            </h1>
            <p className="text-sm text-[#929DA5] mt-1 max-w-2xl">
              Inspect installed multilingual encoders, vision perception backbones, decision policy weights, and hardware acceleration devices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-[#7EE2A8]/10 border border-[#7EE2A8]/30 text-xs font-mono font-bold text-[#7EE2A8] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#7EE2A8] animate-pulse" />
              <span>Device: CPU Execution</span>
            </span>
          </div>
        </div>

        {/* 4 Architecture Component Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Component 1: Multilingual Language Encoder */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#63E6D1]/10 text-[#63E6D1]">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Multilingual Language Encoder</h3>
                  <span className="text-[11px] text-[#929DA5] font-mono">
                    {components.language_encoder?.checkpoint || "MiniLM-L12-v2"}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#7EE2A8]/20 text-[#7EE2A8]">
                Active
              </span>
            </div>

            <p className="text-xs text-[#929DA5] leading-relaxed">
              Extracts spatial constraints, directional headings, landmark references, and sequential goal waypoints across Roman and Devanagari scripts.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/5">
              <div className="bg-white/5 p-2 rounded">
                <span className="text-[10px] text-[#929DA5] block">Embedding Dim</span>
                <span className="text-white font-bold">{components.language_encoder?.embedding_dim || 384}</span>
              </div>
              <div className="bg-white/5 p-2 rounded">
                <span className="text-[10px] text-[#929DA5] block">Fallback Mode</span>
                <span className="text-white font-bold">TF-IDF Char N-Gram</span>
              </div>
            </div>
          </div>

          {/* Component 2: Vision-Language Perception */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#82B9FF]/10 text-[#82B9FF]">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Vision-Language Perception Backbone</h3>
                  <span className="text-[11px] text-[#929DA5] font-mono">
                    {components.vision_encoder?.checkpoint || "CLIP-ViT-B/32"}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#7EE2A8]/20 text-[#7EE2A8]">
                Active
              </span>
            </div>

            <p className="text-xs text-[#929DA5] leading-relaxed">
              Aligns visual viewpoint observations with textual landmark queries. Computes cosine similarity between 360-degree viewpoint angles and detected targets.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/5">
              <div className="bg-white/5 p-2 rounded">
                <span className="text-[10px] text-[#929DA5] block">Feature Dim</span>
                <span className="text-white font-bold">{components.vision_encoder?.feature_dim || 512}</span>
              </div>
              <div className="bg-white/5 p-2 rounded">
                <span className="text-[10px] text-[#929DA5] block">Observation Mode</span>
                <span className="text-white font-bold">Structured Vision</span>
              </div>
            </div>
          </div>

          {/* Component 3: Decision Policy */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F5C66B]/10 text-[#F5C66B]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Multimodal Decision Policy</h3>
                  <span className="text-[11px] text-[#929DA5] font-mono">
                    Hybrid Geometric + Semantic Policy
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#7EE2A8]/20 text-[#7EE2A8]">
                Active
              </span>
            </div>

            <p className="text-xs text-[#929DA5] leading-relaxed">
              Combines instruction alignment, visual landmark matching, Dijkstra shortest-path progress, and history cycle penalties into normalized candidate scores.
            </p>
          </div>

          {/* Component 4: Uncertainty Estimator */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#7EE2A8]/10 text-[#7EE2A8]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Uncertainty Estimator</h3>
                  <span className="text-[11px] text-[#929DA5] font-mono">
                    Candidate Margin & Evidence Verification
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#7EE2A8]/20 text-[#7EE2A8]">
                Active
              </span>
            </div>

            <p className="text-xs text-[#929DA5] leading-relaxed">
              Estimates when the agent is uncertain due to candidate action ambiguity, missing visual landmarks, or unreachable goal topologies, recommending recovery actions.
            </p>
          </div>
        </div>

        {/* Supported Languages Matrix */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Supported Languages & Tokenizers
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {languages.map((l: any) => (
              <div key={l.code} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="font-bold text-white block text-sm">{l.name}</span>
                <span className="text-[11px] text-[#63E6D1] font-mono block">{l.native}</span>
                <span className="text-[9px] text-[#7EE2A8] font-mono mt-1 block">Verified</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
