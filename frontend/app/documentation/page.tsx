"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import LiquidCard from "@/components/ui/LiquidCard";
import {
  BookOpen,
  Compass,
  Layers,
  Cpu,
  BarChart3,
  ExternalLink,
  Code2,
} from "lucide-react";

export default function DocumentationPage() {
  return (
    <AppShell>
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 bg-black text-white">
        
        {/* Header */}
        <div className="space-y-3 pb-8 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-subtle text-[11px] text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              TECHNICAL BLUEPRINT
            </span>
            <span className="text-white/20">/</span>
            <span className="text-white font-medium">Google Research RxR Benchmark</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
            System Architecture & Decision Core
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-3xl leading-relaxed">
            Complete technical specification of Navigate AI: a research-grade Multilingual Vision-and-Language Navigation Decision Agent designed for complex indoor topologies.
          </p>
        </div>

        {/* Section 1: End-to-End Execution Pipeline */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-white" />
            <span>01 / End-to-End Decision Pipeline</span>
          </h2>
          <LiquidCard variant="default" className="p-6 overflow-x-auto font-mono text-xs leading-relaxed text-zinc-300">
            <pre className="text-zinc-200">
{`Natural Language Instruction (English / Hindi / Spanish)
           │
           ▼
[1. Multilingual Instruction Parser]
 ├── Language Detection & Normalization (Devanagari / Latin)
 ├── Landmark & Direction Extraction
 └── Spatial Constraint & Sequential Waypoint Graph
           │
           ▼
[2. Visual Observation Perception]
 ├── 360° Multi-viewpoint Panoramic Synthesis
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
 └── Stream Live Telemetry Events to Simulator UI`}
            </pre>
          </LiquidCard>
        </div>

        {/* Section 2: Mathematical Policy Formulation */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-2">
            <Compass className="w-4 h-4 text-white" />
            <span>02 / Instruction-Conditioned Policy Formulation</span>
          </h2>
          <LiquidCard variant="subtle" className="p-6 space-y-4 text-xs leading-relaxed text-zinc-400 font-light">
            <p>
              At each navigation step t, the agent at node v_t with heading theta_t evaluates candidate action set A(v_t). The composite utility score for candidate action a transitioning to neighbor node v' is computed as:
            </p>

            <div className="p-4 rounded-xl bg-black/70 border border-white/10 font-mono text-white text-xs">
              Score(a) = 0.35 · S_inst(a) + 0.35 · S_lm(a) + 0.30 · S_prog(a) - Penalty_cost(a) - Penalty_history(a)
            </div>
            
            <ul className="list-disc list-inside space-y-2 text-zinc-300 pt-1">
              <li><strong className="text-white">S_inst(a)</strong>: Directional alignment between parsed linguistic turn cues and target edge orientation.</li>
              <li><strong className="text-white">S_lm(a)</strong>: Visual-semantic cosine similarity between candidate viewpoint landmarks and remaining instruction waypoints.</li>
              <li><strong className="text-white">S_prog(a)</strong>: Graph geodesic progress towards destination: [d(v_t, g) - d(v', g)].</li>
              <li><strong className="text-white">Penalty_history(a)</strong>: Heavy suppression penalty for cycles and immediate backtracks (0.60 - 0.80).</li>
            </ul>
          </LiquidCard>
        </div>

        {/* Section 3: Calibrated Uncertainty Estimation */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-white" />
            <span>03 / Uncertainty Estimation & Recovery</span>
          </h2>
          <LiquidCard variant="subtle" className="p-6 space-y-4 text-xs leading-relaxed text-zinc-400 font-light">
            <p>
              Rather than blindly making decisions with arbitrary pseudo-probabilities, Navigate AI continuously validates evidence:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-1.5">
                <span className="font-semibold text-white block">Candidate Ambiguity</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  When top-2 candidate action scores differ by margin &Delta; &lt; 0.08, uncertainty is flagged as medium.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-1.5">
                <span className="font-semibold text-white block">Missing Landmark Evidence</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  If instruction references landmarks not discovered in candidate observations, the agent requests verification.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-1.5">
                <span className="font-semibold text-white block">Unreachable Topology</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  When target destination is disconnected, the agent halts and surfaces a human intervention prompt.
                </p>
              </div>
            </div>
          </LiquidCard>
        </div>

        {/* Section 4: External Research References */}
        <div className="space-y-4 pt-4 border-t border-white/[0.08]">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 font-semibold block">
            04 / Benchmark Citations
          </h2>
          <LiquidCard variant="subtle" className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-white">Google Research — Room-Across-Room (RxR)</span>
              <p className="text-[11px] text-zinc-400 font-light">
                Multilingual benchmark for vision-and-language navigation instruction following.
              </p>
            </div>
            <a
              href="https://research.google/blog/rxr-a-multilingual-benchmark-for-navigation-instruction-following/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg liquid-glass-interactive text-white flex items-center gap-1.5 text-xs font-medium"
            >
              <span>Paper</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </LiquidCard>
        </div>

      </div>
    </AppShell>
  );
}
