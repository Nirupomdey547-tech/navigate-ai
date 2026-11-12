"use client";

import React, { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Hero3D from "@/components/landing/Hero3D";
import LiquidCard from "@/components/ui/LiquidCard";
import {
  Compass,
  ArrowRight,
  Globe2,
  Cpu,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Code2,
  Terminal,
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"en" | "hi" | "es">("en");

  return (
    <AppShell>
      <div className="relative overflow-hidden bg-black text-white selection:bg-white/20">
        
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              {/* Monochromatic Pill Tag */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full liquid-glass-subtle text-xs text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                  Google Research RxR Benchmark
                </span>
                <span className="text-white/20">/</span>
                <span className="text-white font-medium">Multilingual VLN Agent</span>
              </div>

              {/* Oversized Editorial Heading */}
              <div className="space-y-3">
                <h1 className="text-5xl sm:text-7xl font-display font-extrabold tracking-[-0.04em] text-white leading-[1.02]">
                  Navigate beyond <br />
                  <span className="text-gradient-silver">language.</span>
                </h1>
                <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light pt-2">
                  <span className="text-white font-medium">Language is the destination. Intelligence is the path.</span> An autonomous multilingual Vision-and-Language Navigation agent transforming natural instructions into real-time 3D spatial decisions.
                </p>
              </div>

              {/* Primary Call to Action Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/navigation"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-medium text-xs bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_25px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2.5 group"
                >
                  <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
                  <span>Launch Navigation Studio</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/documentation"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-xs liquid-glass-interactive text-zinc-300 hover:text-white flex items-center justify-center gap-2"
                >
                  <Code2 className="w-4 h-4 opacity-70" />
                  <span>Technical Blueprint</span>
                </Link>
              </div>

              {/* Minimalist Architectural Metadata Grid */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.08] max-w-md mx-auto lg:mx-0 text-left">
                <div>
                  <span className="text-2xl font-display font-bold text-white tracking-tight">5</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block pt-0.5">Topologies</span>
                </div>
                <div>
                  <span className="text-2xl font-display font-bold text-white tracking-tight">EN · HI · ES</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block pt-0.5">Multilingual</span>
                </div>
                <div>
                  <span className="text-2xl font-display font-bold text-white tracking-tight">RxR</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block pt-0.5">Standard Metrics</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating 3D Digital Twin Canvas */}
            <div className="lg:col-span-5 relative">
              <div className="w-full h-[480px] rounded-3xl liquid-glass-elevated relative overflow-hidden group">
                <Hero3D />
                {/* Floating Telemetry Glass Badge */}
                <div className="absolute bottom-5 inset-x-5 p-3.5 rounded-xl liquid-glass-elevated flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
                    <span className="font-mono text-[11px] text-zinc-300 tracking-wide">
                      Decision Policy Stream
                    </span>
                  </div>
                  <Link
                    href="/navigation"
                    className="text-white hover:text-zinc-300 text-[11px] font-medium flex items-center gap-1 group/btn"
                  >
                    <span>Launch</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW THE AGENT WORKS */}
        <section id="features" className="py-24 border-t border-white/[0.08] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-16">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
              Architectural Core
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              From Multilingual Cues to Spatial Decisions
            </h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Every navigation step is evaluated through an integrated pipeline of natural language parsing, 360° visual landmark grounding, Dijkstra geodesic progress, and uncertainty estimation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Multilingual Instruction Parsing",
                desc: "Extracts direction constraints, landmark mentions, and sequential goals across English, Hindi, and Spanish.",
                icon: Globe2,
              },
              {
                step: "02",
                title: "Visual Scene Perception",
                desc: "Evaluates 360° candidate viewpoints with visual-semantic cosine alignment against target landmarks.",
                icon: Cpu,
              },
              {
                step: "03",
                title: "Instruction-Conditioned Policy",
                desc: "Multi-criteria utility scoring balances heading vectors, landmark grounding, geodesic progress, and loop penalties.",
                icon: Compass,
              },
              {
                step: "04",
                title: "Uncertainty & Failure Detection",
                desc: "Calculates candidate margin ambiguity and Shannon entropy to detect unfamiliar or ambiguous situations.",
                icon: Activity,
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <LiquidCard
                  key={f.step}
                  variant="subtle"
                  className="p-6 space-y-4 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-zinc-600">{f.step}</span>
                    <Icon className="w-4 h-4 text-zinc-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {f.desc}
                  </p>
                </LiquidCard>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: MULTILINGUAL UNDERSTANDING DEMO */}
        <section className="py-24 border-t border-white/[0.08] bg-black/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                  Cross-Lingual Generalization
                </span>
                <h2 className="text-3xl font-display font-extrabold text-white tracking-tight">
                  Multilingual Navigation Instructions
                </h2>
                <p className="text-sm text-zinc-400 max-w-xl font-light">
                  Inspect how semantically equivalent instructions in English, Hindi, and Spanish are parsed into identical topological navigation plans.
                </p>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex rounded-xl p-1 liquid-glass-subtle self-start">
                {[
                  { id: "en", label: "English" },
                  { id: "hi", label: "हिन्दी (Hindi)" },
                  { id: "es", label: "Español" },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setActiveTab(lang.id as any)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === lang.id
                        ? "bg-white text-black shadow-sm font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Instruction Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <LiquidCard variant="default" className="p-7 space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
                    Input Instruction ({activeTab.toUpperCase()})
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Natural Language</span>
                </div>
                
                <blockquote className="text-base text-zinc-200 font-light leading-relaxed pl-4 border-l-2 border-white/40 italic">
                  {activeTab === "en" && '"Walk forward past the reception desk, turn left at the central corridor, and enter the executive office at the end of the hall."'}
                  {activeTab === "hi" && '"सीधे गलियारे में आगे बढ़ें, सीढ़ियों के पास बाएं मुड़ें और रिसेप्शन डेस्क के सामने से गुजरते हुए आखिरी कमरे में जाएं।"'}
                  {activeTab === "es" && '"Avanza pasando la recepción, gira a la izquierda en el pasillo central y entra a la oficina ejecutiva al final."'}
                </blockquote>

                <div className="pt-2">
                  <Link
                    href="/navigation"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium liquid-glass-interactive text-white"
                  >
                    <Compass className="w-3.5 h-3.5 opacity-80" />
                    <span>Run in Navigation Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </LiquidCard>

              <LiquidCard variant="subtle" className="p-7 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                    Structured Semantic Output
                  </span>
                  <span className="text-[10px] text-zinc-500">JSON Payload</span>
                </div>
                
                <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-2 text-zinc-300">
                  <div><span className="text-zinc-500">language:</span> <span className="text-white">"{activeTab}"</span></div>
                  <div><span className="text-zinc-500">initial_direction:</span> <span className="text-white">"forward"</span></div>
                  <div><span className="text-zinc-500">landmarks:</span> <span className="text-zinc-300">["reception", "corridor", "office"]</span></div>
                  <div><span className="text-zinc-500">destination:</span> <span className="text-white font-semibold">"executive_office"</span></div>
                  <div><span className="text-zinc-500">waypoints:</span> <span className="text-zinc-400">["reception", "corridor_south", "executive_office"]</span></div>
                </div>
              </LiquidCard>

            </div>
          </div>
        </section>

        {/* SECTION 4: RXR BENCHMARK METRICS */}
        <section className="py-24 border-t border-white/[0.08] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-16">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
              Standardized Research Evaluation
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Google Research RxR Metrics
            </h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Every navigation trajectory is scored against established Room-Across-Room research metrics to evaluate both final destination precision and path fidelity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: "SR",
                name: "Success Rate",
                desc: "Percentage of navigation episodes terminating within 3.0 meters of the ground-truth destination node.",
              },
              {
                id: "SPL",
                name: "Success by Path Length",
                desc: "Evaluates trajectory optimality: rewards short, direct paths and penalizes unnecessary looping.",
              },
              {
                id: "nDTW",
                name: "Normalized DTW",
                desc: "Calculates continuous Dynamic Time Warping alignment between agent trajectory and reference human path.",
              },
              {
                id: "SDTW",
                name: "Success Weighted nDTW",
                desc: "Strict combination metric that requires both successful destination arrival and high trajectory fidelity.",
              },
            ].map((metric) => (
              <LiquidCard key={metric.id} variant="subtle" className="p-6 space-y-3">
                <span className="text-xs font-mono font-bold text-white block tracking-wider">
                  {metric.id}
                </span>
                <h3 className="text-sm font-semibold text-zinc-200">
                  {metric.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  {metric.desc}
                </p>
              </LiquidCard>
            ))}
          </div>
        </section>

        {/* SECTION 5: FOOTER CALL TO ACTION */}
        <section className="py-24 border-t border-white/[0.08] bg-black">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              Explore Autonomous Navigation
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
              Experience the 3D interactive simulator, test multilingual navigation instructions in real-time, and inspect grounded decisions.
            </p>
            <div className="pt-2">
              <Link
                href="/navigation"
                className="px-8 py-3.5 rounded-xl font-medium text-xs bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] inline-flex items-center gap-2 group"
              >
                <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
                <span>Launch Navigation Studio</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="pt-10 text-[11px] text-zinc-500 font-mono tracking-wider uppercase">
              Navigate AI · Google Research Room-Across-Room (RxR) Challenge System
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
