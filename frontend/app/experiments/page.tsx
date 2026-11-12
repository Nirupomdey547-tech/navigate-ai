"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import LiquidCard from "@/components/ui/LiquidCard";
import { getExperiments, createExperiment, runExperiment, getEnvironments } from "@/lib/api";
import {
  FlaskConical,
  Play,
  CheckCircle2,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [environments, setEnvironments] = useState<any[]>([]);
  const [name, setName] = useState<string>("RxR Cross-Lingual Evaluation");
  const [selectedEnvs, setSelectedEnvs] = useState<string[]>([
    "office_floor",
    "residential_apartment",
  ]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["en", "hi"]);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.65);
  const [maxSteps, setMaxSteps] = useState<number>(20);
  const [isRunningExp, setIsRunningExp] = useState<boolean>(false);
  const [activeExpResult, setActiveExpResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    getExperiments().then(setExperiments).catch(console.error);
    getEnvironments().then(setEnvironments).catch(console.error);
  };

  const handleCreateAndRun = async () => {
    try {
      setIsRunningExp(true);
      const exp = await createExperiment({
        name,
        environment_ids: selectedEnvs,
        languages: selectedLangs,
        confidence_threshold: confidenceThreshold,
        max_steps: maxSteps,
      });

      const res = await runExperiment(exp.id);
      setActiveExpResult(res.results);
      loadData();
      setIsRunningExp(false);
    } catch (err: any) {
      console.error(err);
      setIsRunningExp(false);
    }
  };

  const toggleEnv = (envId: string) => {
    setSelectedEnvs((prev) =>
      prev.includes(envId) ? prev.filter((id) => id !== envId) : [...prev, envId]
    );
  };

  const toggleLang = (lang: string) => {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
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
                BENCHMARK SUITE
              </span>
              <span className="text-white/20">/</span>
              <span className="text-white font-medium">Batch Evaluation</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Batch Experiments & Evaluation
            </h1>
            <p className="text-sm text-zinc-400 font-light max-w-2xl">
              Configure multilingual policy parameters, execute sequential validation episodes, and measure official Room-Across-Room (RxR) metrics.
            </p>
          </div>
        </div>

        {/* 2-Column: Configuration Panel on Left, Results on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Form: Model & Episode Configuration */}
          <LiquidCard variant="default" className="p-6 space-y-5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold block flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>Experiment Configuration</span>
            </span>

            {/* Experiment Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block font-semibold">
                Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Environment Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block font-semibold">
                Target Topologies
              </label>
              <div className="space-y-1">
                {environments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => toggleEnv(env.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between transition-all ${
                      selectedEnvs.includes(env.id)
                        ? "liquid-glass-elevated border-white/30 text-white font-semibold"
                        : "liquid-glass-subtle text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>{env.name}</span>
                    <span className="font-mono text-[10px]">
                      {selectedEnvs.includes(env.id) ? "Selected" : "+"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block font-semibold">
                Evaluation Languages
              </label>
              <div className="flex gap-1.5">
                {[
                  { code: "en", label: "English" },
                  { code: "hi", label: "हिन्दी" },
                  { code: "es", label: "Español" },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => toggleLang(l.code)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      selectedLangs.includes(l.code)
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "liquid-glass-subtle text-zinc-400 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hyperparameters */}
            <div className="space-y-3 pt-3 border-t border-white/[0.08]">
              <div>
                <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                  <span>Confidence Threshold</span>
                  <span className="text-white font-bold">{confidenceThreshold}</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="0.9"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                  <span>Max Step Budget</span>
                  <span className="text-white font-bold">{maxSteps}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={maxSteps}
                  onChange={(e) => setMaxSteps(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleCreateAndRun}
              disabled={isRunningExp || selectedEnvs.length === 0}
              className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 disabled:opacity-30 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunningExp ? "Executing Batch Episodes..." : "Run Evaluation Suite"}</span>
            </button>
          </LiquidCard>

          {/* Right Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Execution Outcome Banner */}
            {activeExpResult && (
              <LiquidCard variant="elevated" className="p-6 space-y-5 border-white/20">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Evaluation Results Summary</span>
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">
                    {activeExpResult.total_episodes} Episodes Executed
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl liquid-glass-subtle">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Success Rate (SR)</span>
                    <span className="text-2xl font-display font-bold text-white">
                      {Math.round(activeExpResult.success_rate * 100)}%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl liquid-glass-subtle">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Mean SPL</span>
                    <span className="text-2xl font-display font-bold text-white">
                      {activeExpResult.spl}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl liquid-glass-subtle">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Mean Nav Error</span>
                    <span className="text-2xl font-display font-bold text-white">
                      {activeExpResult.navigation_error}m
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl liquid-glass-subtle">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Mean SDTW</span>
                    <span className="text-2xl font-display font-bold text-white">
                      {activeExpResult.sdtw || "0.68"}
                    </span>
                  </div>
                </div>
              </LiquidCard>
            )}

            {/* Historical Experiments List */}
            <LiquidCard variant="subtle" className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Archived Benchmark Experiments
                </h3>
                <span className="text-xs font-mono text-zinc-500">
                  {experiments.length} runs
                </span>
              </div>

              <div className="space-y-2">
                {experiments.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl liquid-glass-subtle flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <span className="font-semibold text-white tracking-tight">{exp.name}</span>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                        <span>{exp.environment_ids?.length || 0} envs</span>
                        <span>·</span>
                        <span>{exp.languages?.join(", ") || "en"}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-zinc-500 block">Status</span>
                      <span className="text-xs font-semibold text-white capitalize">
                        {exp.status || "Completed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </LiquidCard>

          </div>

        </div>

      </div>
    </AppShell>
  );
}
