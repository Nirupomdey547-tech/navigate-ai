"use client";

import React, { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Hero3D from "@/components/landing/Hero3D";
import {
  Compass,
  ArrowRight,
  Globe2,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  BarChart3,
  ExternalLink,
  Code2,
  Terminal,
  ChevronRight,
  Activity,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"en" | "hi">("en");

  return (
    <AppShell>
      <div className="relative overflow-hidden">
        {/* Ambient background glow orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#63E6D1]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[800px] right-10 w-[500px] h-[500px] bg-[#82B9FF]/10 rounded-full blur-[160px] pointer-events-none" />

        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-[#929DA5]">
                <span className="w-2 h-2 rounded-full bg-[#63E6D1] animate-pulse" />
                <span className="font-semibold text-white/90">Google Research RxR Challenge</span>
                <span className="text-white/20">|</span>
                <span className="text-[#63E6D1]">Multilingual VLN Agent</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Navigate beyond{" "}
                <span className="bg-gradient-to-r from-[#63E6D1] via-[#82B9FF] to-white bg-clip-text text-transparent">
                  language.
                </span>
              </h1>

              {/* Tagline & Description */}
              <p className="text-base sm:text-lg text-[#929DA5] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                <strong className="text-white font-medium">Language is the destination. Intelligence is the path.</strong> An autonomous multilingual Vision-and-Language Navigation agent transforming raw natural-language instructions into real-time 3D spatial decisions.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/navigation"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#63E6D1] to-[#82B9FF] text-[#0A0D10] shadow-xl shadow-[#63E6D1]/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 group"
                >
                  <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                  <span>Launch Navigation Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/documentation"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-xs bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Code2 className="w-4 h-4 text-[#82B9FF]" />
                  <span>Explore Architecture</span>
                </Link>
              </div>

              {/* Quick Spec Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.08] max-w-md mx-auto lg:mx-0 text-left">
                <div>
                  <span className="text-xl font-bold font-mono text-white">5+</span>
                  <span className="text-[11px] text-[#929DA5] block">3D Environments</span>
                </div>
                <div>
                  <span className="text-xl font-bold font-mono text-[#63E6D1]">EN / HI</span>
                  <span className="text-[11px] text-[#929DA5] block">Multilingual Support</span>
                </div>
                <div>
                  <span className="text-xl font-bold font-mono text-[#82B9FF]">RxR</span>
                  <span className="text-[11px] text-[#929DA5] block">Standard Metrics</span>
                </div>
              </div>
            </div>

            {/* Right Hero 3D Simulation Canvas */}
            <div className="lg:col-span-5 relative">
              <div className="w-full h-[460px] rounded-3xl border border-white/10 bg-[#0A0D10]/80 backdrop-blur-2xl shadow-2xl overflow-hidden relative group">
                <Hero3D />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#0A0D10]/90 backdrop-blur-md border border-white/10 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#63E6D1] animate-pulse" />
                    <span className="font-mono text-white/90">Autonomous Policy Active</span>
                  </div>
                  <Link
                    href="/navigation"
                    className="text-[#63E6D1] font-semibold text-[11px] hover:underline flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW THE AGENT WORKS */}
        <section id="features" className="py-20 border-t border-white/[0.08] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#63E6D1]">
              Architectural Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Multilingual Cues to Spatial Action
            </h2>
            <p className="text-sm text-[#929DA5]">
              Every navigation decision is computed through a calibrated sequence of language understanding, visual feature extraction, topological path planning, and uncertainty evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Multilingual Instruction Parsing",
                desc: "Extracts direction constraints, landmark mentions, and sequential waypoints across Roman and Devanagari scripts.",
                icon: Globe2,
                color: "#63E6D1",
              },
              {
                step: "02",
                title: "Visual Scene Perception",
                desc: "Evaluates 360° candidate viewpoints with visual-semantic cosine alignment against target landmarks.",
                icon: Cpu,
                color: "#82B9FF",
              },
              {
                step: "03",
                title: "Instruction-Conditioned Policy",
                desc: "Hybrid scoring balances linguistic turn match, landmark evidence, Dijkstra geodesic progress, and loop penalties.",
                icon: Compass,
                color: "#F5C66B",
              },
              {
                step: "04",
                title: "Uncertainty & Replanning",
                desc: "Monitors candidate decision margins and missing landmark evidence to detect ambiguity before executing steps.",
                icon: Activity,
                color: "#7EE2A8",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.step}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/20 transition-all space-y-4 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-[#929DA5]">{f.step}</span>
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#63E6D1] transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-[#929DA5] leading-relaxed font-light">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: MULTILINGUAL UNDERSTANDING DEMO */}
        <section className="py-20 border-t border-white/[0.08] bg-[#070A0D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#82B9FF]">
                  Cross-Lingual Generalization
                </span>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  English and Hindi Navigation Instructions
                </h2>
                <p className="text-sm text-[#929DA5] max-w-xl">
                  Inspect how semantically equivalent instructions in English and Hindi are parsed and executed by the identical underlying decision policy.
                </p>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/10 self-start">
                <button
                  onClick={() => setActiveTab("en")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "en" ? "bg-[#63E6D1] text-[#0A0D10]" : "text-[#929DA5] hover:text-white"
                  }`}
                >
                  English Instruction
                </button>
                <button
                  onClick={() => setActiveTab("hi")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "hi" ? "bg-[#63E6D1] text-[#0A0D10]" : "text-[#929DA5] hover:text-white"
                  }`}
                >
                  हिन्दी (Hindi) Instruction
                </button>
              </div>
            </div>

            {/* Instruction Showcase Box */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#10161B] border border-white/10 space-y-4">
                <span className="text-xs font-mono font-bold text-[#63E6D1] uppercase">
                  Raw Natural Language Input ({activeTab.toUpperCase()})
                </span>
                <blockquote className="text-base text-white font-medium italic border-l-2 border-[#63E6D1] pl-4 py-1">
                  {activeTab === "en"
                    ? '"Walk forward past the reception desk, turn left at the central corridor, and enter the executive office at the end of the hall."'
                    : '"सीधे गलियारे में आगे बढ़ें, सीढ़ियों के पास बाएं मुड़ें और रिसेप्शन डेस्क के सामने से गुजरते हुए आखिरी कमरे में जाएं।"'}
                </blockquote>
                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href="/navigation"
                    className="px-4 py-2 rounded-lg bg-[#63E6D1]/20 border border-[#63E6D1] text-[#63E6D1] text-xs font-bold hover:bg-[#63E6D1]/30 transition-all flex items-center gap-1.5"
                  >
                    <span>Run in Navigation Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 text-xs font-mono">
                <span className="text-xs font-bold text-[#82B9FF] uppercase tracking-wider block">
                  Parsed Structured Representation
                </span>
                <div className="p-3.5 rounded-xl bg-[#0A0D10] border border-white/5 space-y-1.5 text-white/90">
                  <div><span className="text-[#929DA5]">language:</span> <span className="text-[#63E6D1]">"{activeTab}"</span></div>
                  <div><span className="text-[#929DA5]">initial_direction:</span> <span className="text-[#82B9FF]">"forward"</span></div>
                  <div><span className="text-[#929DA5]">landmarks:</span> <span className="text-white">["reception", "corridor", "room"]</span></div>
                  <div><span className="text-[#929DA5]">destination:</span> <span className="text-[#7EE2A8]">"executive_office"</span></div>
                  <div><span className="text-[#929DA5]">waypoints:</span> <span className="text-[#F5C66B]">["reception", "corridor_south", "executive_office"]</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: RXR BENCHMARK METRICS */}
        <section className="py-20 border-t border-white/[0.08] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7EE2A8]">
              Standardized Evaluation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Google Research RxR Metrics
            </h2>
            <p className="text-sm text-[#929DA5]">
              Every navigation trajectory is scored using established Room-Across-Room research metrics to evaluate both goal attainment and trajectory fidelity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <span className="text-xs font-mono text-[#63E6D1] font-bold block">SR</span>
              <h3 className="text-sm font-bold text-white">Success Rate</h3>
              <p className="text-xs text-[#929DA5] leading-relaxed">
                Binary indicator of whether the agent stopped within 3.0 meters of the intended target destination.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <span className="text-xs font-mono text-[#82B9FF] font-bold block">SPL</span>
              <h3 className="text-sm font-bold text-white">Success Weighted by Path Length</h3>
              <p className="text-xs text-[#929DA5] leading-relaxed">
                Penalizes meandering or excessive trajectories: S · (L_optimal / max(L_optimal, L_agent)).
              </p>
            </div>


            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <span className="text-xs font-mono text-[#F5C66B] font-bold block">nDTW</span>
              <h3 className="text-sm font-bold text-white">Normalized Dynamic Time Warping</h3>
              <p className="text-xs text-[#929DA5] leading-relaxed">
                Measures the continuous geodesic alignment between the agent path and the reference human demonstrator path.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <span className="text-xs font-mono text-[#7EE2A8] font-bold block">SDTW</span>
              <h3 className="text-sm font-bold text-white">Success Weighted nDTW</h3>
              <p className="text-xs text-[#929DA5] leading-relaxed">
                Strict metric that rewards high path fidelity only when the final destination is successfully attained.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: FOOTER CALL TO ACTION */}
        <section className="py-20 border-t border-white/[0.08] bg-gradient-to-b from-[#0A0D10] to-[#10161B]">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to explore autonomous navigation?
            </h2>
            <p className="text-sm text-[#929DA5] max-w-xl mx-auto font-light">
              Experience the 3D interactive simulator, test multilingual navigation instructions in real-time, and inspect grounded decisions.
            </p>
            <div className="pt-2">
              <Link
                href="/navigation"
                className="px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#63E6D1] to-[#82B9FF] text-[#0A0D10] shadow-2xl shadow-[#63E6D1]/30 hover:opacity-95 transition-all inline-flex items-center gap-2"
              >
                <Compass className="w-5 h-5" />
                <span>Launch Navigation Studio Now</span>
              </Link>
            </div>
            <div className="pt-8 text-xs text-[#929DA5] font-mono">
              Navigate AI • Google Research Room-Across-Room (RxR) Reference System
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
