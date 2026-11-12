"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { getExperiments, createExperiment, runExperiment, getEnvironments } from "@/lib/api";
import {
  FlaskConical,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Globe2,
  Sliders,
  TrendingUp,
  Cpu,
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
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#63E6D1]/10 text-[#63E6D1] border border-[#63E6D1]/20">
                RESEARCH WORKSPACE
              </span>
              <span className="text-xs text-[#929DA5]">Automated Batch Episode Benchmarking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Evaluation & Batch Experiments
            </h1>
            <p className="text-sm text-[#929DA5] mt-1 max-w-2xl">
              Configure multilingual policy parameters, execute sequential validation episodes, and measure official Room-Across-Room (RxR) metrics.
            </p>
          </div>
        </div>

        {/* 2-Column: Configuration Panel on Left, Results on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Model & Episode Configuration */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-5">
            <span className="text-xs font-bold text-white uppercase tracking-wider block flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#63E6D1]" />
              <span>Experiment Configuration</span>
            </span>

            {/* Experiment Title */}
            <div>
              <label className="text-[11px] font-semibold text-[#929DA5] uppercase tracking-wider block mb-1">
                Experiment Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#10161B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#63E6D1]"
              />
            </div>

            {/* Environment Selection */}
            <div>
              <label className="text-[11px] font-semibold text-[#929DA5] uppercase tracking-wider block mb-1.5">
                Target Environments
              </label>
              <div className="space-y-1.5">
                {environments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => toggleEnv(env.id)}
                    className={`w-full text-left p-2 rounded-lg text-xs font-medium border flex items-center justify-between transition-all ${
                      selectedEnvs.includes(env.id)
                        ? "bg-[#63E6D1]/10 border-[#63E6D1] text-white"
                        : "bg-white/[0.02] border-white/5 text-[#929DA5]"
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
            <div>
              <label className="text-[11px] font-semibold text-[#929DA5] uppercase tracking-wider block mb-1.5">
                Instruction Languages
              </label>
              <div className="flex gap-2">
                {[
                  { code: "en", label: "English" },
                  { code: "hi", label: "हिन्दी (Hindi)" },
                  { code: "es", label: "Español" },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => toggleLang(l.code)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      selectedLangs.includes(l.code)
                        ? "bg-[#82B9FF]/20 border-[#82B9FF] text-[#82B9FF]"
                        : "bg-white/[0.02] border-white/5 text-[#929DA5]"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hyperparameters: Confidence Threshold & Max Steps */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#929DA5]">Confidence Threshold</span>
                  <span className="font-mono text-white">{confidenceThreshold}</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="0.9"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-[#63E6D1]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#929DA5]">Max Navigation Steps</span>
                  <span className="font-mono text-white">{maxSteps}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={maxSteps}
                  onChange={(e) => setMaxSteps(parseInt(e.target.value))}
                  className="w-full accent-[#82B9FF]"
                />
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleCreateAndRun}
              disabled={isRunningExp || selectedEnvs.length === 0}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#63E6D1] to-[#82B9FF] text-[#0A0D10] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#63E6D1]/20 disabled:opacity-40 hover:opacity-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isRunningExp ? "Executing Episodes..." : "Run Batch Evaluation"}</span>
            </button>
          </div>

          {/* Right Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Execution Outcome Banner */}
            {activeExpResult && (
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-[#63E6D1]/40 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7EE2A8]" />
                    <span>Evaluation Results Summary</span>
                  </h3>
                  <span className="text-xs font-mono text-[#63E6D1]">
                    {activeExpResult.total_episodes} Episodes Executed
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-[#929DA5] block uppercase">Success Rate (SR)</span>
                    <span className="text-xl font-bold font-mono text-[#7EE2A8]">
                      {Math.round(activeExpResult.success_rate * 100)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-[#929DA5] block uppercase">Avg SPL</span>
                    <span className="text-xl font-bold font-mono text-[#63E6D1]">
                      {activeExpResult.spl}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-[#929DA5] block uppercase">Avg Nav Error</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {activeExpResult.navigation_error}m
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-[#929DA5] block uppercase">nDTW Score</span>
                    <span className="text-xl font-bold font-mono text-[#82B9FF]">
                      {activeExpResult.ndtw}
                    </span>
                  </div>
                </div>

                {/* Multilingual breakdown */}
                {activeExpResult.by_language && (
                  <div>
                    <span className="text-[11px] font-semibold text-[#929DA5] uppercase tracking-wider block mb-2">
                      Cross-Lingual Comparison
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(activeExpResult.by_language).map(([lang, ldata]: any) => (
                        <div
                          key={lang}
                          className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white uppercase">{lang}</span>
                            <span className="text-[10px] text-[#929DA5] block">
                              {ldata.total} episodes
                            </span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-[#7EE2A8] font-bold block">
                              SR: {Math.round(ldata.success_rate * 100)}%
                            </span>
                            <span className="text-[#63E6D1] text-[10px]">
                              SPL: {ldata.avg_spl}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Historical Experiments List */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Saved Experiments History ({experiments.length})
              </h3>

              <div className="space-y-3">
                {experiments.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[#63E6D1] font-bold">#{exp.id}</span>
                        <h4 className="font-bold text-white text-sm">{exp.name}</h4>
                        <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-white/10 text-[#7EE2A8]">
                          {exp.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#929DA5]">
                        Environments: {exp.environment_ids?.join(", ")}
                      </p>
                    </div>

                    {exp.results?.success_rate !== undefined && (
                      <div className="flex items-center gap-4 font-mono text-right">
                        <div>
                          <span className="text-[10px] text-[#929DA5] block">Success Rate</span>
                          <span className="font-bold text-[#7EE2A8]">
                            {Math.round(exp.results.success_rate * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#929DA5] block">SPL</span>
                          <span className="font-bold text-[#63E6D1]">{exp.results.spl}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
