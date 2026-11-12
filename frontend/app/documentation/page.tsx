"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import {
  BookOpen,
  Compass,
  Layers,
  Cpu,
  BarChart3,
  ExternalLink,
  Code2,
  Sparkles,
} from "lucide-react";

export default function DocumentationPage() {
  return (
    <AppShell>
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header */}
        <div className="pb-6 border-b border-white/[0.08] space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#63E6D1]/10 text-[#63E6D1] border border-[#63E6D1]/20">
              TECHNICAL DOCUMENTATION
            </span>
            <span className="text-xs text-[#929DA5]">Google Research RxR Benchmark</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            System Architecture & Decision Engine
          </h1>
          <p className="text-sm text-[#929DA5] max-w-3xl leading-relaxed">
            Complete technical specification of Navigate AI: a research-grade Multilingual Vision-and-Language Navigation Decision Agent designed for complex indoor topologies.
          </p>
        </div>

        {/* Section 1: End-to-End Execution Pipeline */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#63E6D1]" />
            <span>1. End-to-End Decision Pipeline</span>
          </h2>
          <div className="p-5 rounded-2xl bg-[#10161B] border border-white/[0.08] text-xs font-mono text-white/90 leading-relaxed overflow-x-auto">
            <pre className="text-[#63E6D1]">
{`Natural Language Instruction (EN / HI / ES)
           │
           ▼
[1. Multilingual Instruction Parser]
 ├── Language Detection & Normalization
 ├── Landmark & Direction Extraction
 └── Spatial Constraint & Sequential Waypoint Graph
           │
           ▼
[2. Visual Observation Encoder]
 ├── 360° Multi-viewpoint Perception
 └── Visual-Semantic Landmark Similarity Matching
           │
           ▼
[3. State-Space Representation]
 ├── Current Node, Heading & Traveled Path
 └── Shortest-Path Topological Distance (Dijkstra / A*)
           │
           ▼
[4. Multimodal Action Scoring Policy]
 ├── S(a) = w_inst·S_inst + w_lm·S_lm + w_prog·S_prog - Cost - LoopPenalty
 ├── Uncertainty Margin Estimation (Top-1 vs Top-2)
 └── Grounded Decision Explanation Generation
           │
           ▼
[5. Environment Transition & State Update]
 ├── Execute Action & Update Physical Pose
 ├── Metric Update (SR, SPL, NE, nDTW, SDTW)
 └── Stream Live WebSocket Events to Simulator UI`}
            </pre>
          </div>
        </div>

        {/* Section 2: Mathematical Policy Formulation */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#82B9FF]" />
            <span>2. Instruction-Conditioned Policy Formulation</span>
          </h2>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 text-xs leading-relaxed text-[#929DA5]">
            <p>
              At each navigation step t, the agent at node v_t with heading theta_t evaluates candidate action set A(v_t). The composite score for candidate action a in A(v_t) transitioning to neighbor node v' is:
            </p>

            <div className="p-3 rounded-xl bg-[#10161B] border border-white/5 font-mono text-white text-xs">
              Score(a) = 0.35 · S_inst(a) + 0.35 · S_lm(a) + 0.30 · S_prog(a) - Penalty_cost(a) - Penalty_history(a)
            </div>
            <ul className="list-disc list-inside space-y-1 text-white/80">
              <li><strong>S_inst(a)</strong>: Directional alignment between parsed linguistic turn cues and target edge orientation.</li>
              <li><strong>S_lm(a)</strong>: Visual-semantic cosine similarity between candidate viewpoint landmarks and remaining instruction waypoints.</li>
              <li><strong>S_prog(a)</strong>: Graph geodesic progress towards destination: $d(v_t, g) - d(v', g)$.</li>
              <li><strong>Penalty_history(a)</strong>: Heavy suppression penalty for cycles and immediate backtracks ($0.60 - 0.80$).</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Calibrated Uncertainty Estimation */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#F5C66B]" />
            <span>3. Uncertainty Estimation & Recovery</span>
          </h2>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 text-xs leading-relaxed text-[#929DA5]">
            <p>
              Rather than blindly making decisions with arbitrary pseudo-probabilities, Navigate AI continuously validates evidence:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="font-bold text-[#F5C66B] block">Candidate Ambiguity</span>
                <p className="text-[11px]">When top-2 candidate action scores differ by $\Delta &lt; 0.08$, uncertainty is flagged as medium.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="font-bold text-[#FF7777] block">Missing Landmark Evidence</span>
                <p className="text-[11px]">If instruction references landmarks not discovered in candidate observations, the agent requests observation verification.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="font-bold text-[#82B9FF] block">Unreachable Topology</span>
                <p className="text-[11px]">If the destination has no reachable graph path ($d = \infty$), the agent halts and initiates replanning.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: RxR Benchmark Integration */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#7EE2A8]" />
            <span>4. Google Research Room-Across-Room (RxR) Benchmark</span>
          </h2>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 text-xs leading-relaxed text-[#929DA5]">
            <p>
              Room-Across-Room is the first multilingual benchmark for Vision-and-Language Navigation, containing multilingual trajectories in English, Hindi, and Telugu across Matterport3D environments.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-mono font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-[10px] text-[#929DA5] block">SR</span>
                <span className="font-bold text-[#7EE2A8]">Success Rate</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-[10px] text-[#929DA5] block">SPL</span>
                <span className="font-bold text-[#63E6D1]">Path-Weighted Success</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-[10px] text-[#929DA5] block">nDTW</span>
                <span className="font-bold text-[#82B9FF]">Normalized DTW</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-[10px] text-[#929DA5] block">SDTW</span>
                <span className="font-bold text-white">Success-Weighted DTW</span>
              </div>
            </div>
            <a
              href="https://research.google/blog/rxr-a-multilingual-benchmark-for-navigation-instruction-following/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#63E6D1] hover:underline pt-2 font-medium"
            >
              <span>Read Google Research RxR Paper & Documentation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
