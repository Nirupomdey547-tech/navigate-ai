"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import TopDownMap2D from "@/components/simulator/TopDownMap2D";
import LiquidCard from "@/components/ui/LiquidCard";
import { getHistory, getRunDetails, getRunReplay, getEnvironment } from "@/lib/api";
import {
  History,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  Compass,
} from "lucide-react";

export default function HistoryPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [runDetails, setRunDetails] = useState<any>(null);
  const [replayData, setReplayData] = useState<any>(null);
  const [envData, setEnvData] = useState<any>(null);

  // Playback timeline state
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    getHistory().then((data) => {
      setRuns(data);
      if (data.length > 0) {
        selectRun(data[0].id);
      }
    });
  }, []);

  const selectRun = async (id: number) => {
    setSelectedRunId(id);
    setIsPlaying(false);
    setCurrentStepIdx(0);

    try {
      const details = await getRunDetails(id);
      setRunDetails(details);

      const replay = await getRunReplay(id);
      setReplayData(replay);

      if (details.environment_id) {
        const env = await getEnvironment(details.environment_id);
        setEnvData(env);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auto playback loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && replayData && replayData.steps?.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= replayData.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, replayData]);

  const activeStep = replayData?.steps?.[currentStepIdx] || null;
  const pathUpToCurrentStep = runDetails?.final_path?.slice(0, currentStepIdx + 1) || [];

  return (
    <AppShell>
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-black text-white">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/[0.08]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-subtle text-[11px] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                AUDIT LOGS
              </span>
              <span className="text-white/20">/</span>
              <span className="text-white font-medium">Trajectory Inspector</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Navigation History & Replay
            </h1>
            <p className="text-sm text-zinc-400 font-light max-w-2xl">
              Inspect historical navigation episodes step-by-step. Replay agent trajectories, review decision rationales, confidence scores, and uncertainty states.
            </p>
          </div>
        </div>

        {/* 2-Column: Left Runs List, Right Step-by-Step Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Runs List */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold block">
              Recorded Episodes ({runs.length})
            </span>

            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {runs.map((r) => (
                <button
                  key={r.id}
                  onClick={() => selectRun(r.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedRunId === r.id
                      ? "liquid-glass-elevated border-white/30 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.2)]"
                      : "liquid-glass-subtle hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-semibold text-white">
                      Episode #{r.id}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                        r.success === 1
                          ? "border-white/30 text-white bg-white/5"
                          : "border-zinc-700 text-zinc-500 bg-transparent"
                      }`}
                    >
                      {r.success === 1 ? "Goal Reached" : "Halted"}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-zinc-200 truncate">{r.environment_id}</h4>
                  <p className="text-xs text-zinc-400 font-light line-clamp-2 mt-1 leading-relaxed">
                    {r.instruction}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.08] text-[10px] text-zinc-400 font-mono">
                    <span className="uppercase text-white">{r.language || "en"}</span>
                    <span>{r.steps} steps</span>
                    {r.metrics?.spl && <span className="text-zinc-300">SPL: {r.metrics.spl}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Inspector & Scrubber Replay */}
          <div className="lg:col-span-2 space-y-6">
            {runDetails && (
              <>
                {/* Run Overview Metadata Card */}
                <LiquidCard variant="default" className="p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold block">
                        Trace #{runDetails.id} · {runDetails.environment_id}
                      </span>
                      <h3 className="text-sm font-semibold text-white leading-relaxed">
                        {runDetails.instruction}
                      </h3>
                    </div>
                    {runDetails.metrics && (
                      <div className="flex gap-2 font-mono text-xs shrink-0">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                          <span className="text-[9px] text-zinc-500 block">SPL</span>
                          <span className="font-bold text-white">{runDetails.metrics.spl}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                          <span className="text-[9px] text-zinc-500 block">SR</span>
                          <span className="font-bold text-white">{runDetails.success ? "100%" : "0%"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </LiquidCard>

                {/* 2D Topological Replay Viewer */}
                {envData && (
                  <div className="h-80 rounded-3xl liquid-glass-elevated overflow-hidden relative">
                    <TopDownMap2D
                      nodes={envData.nodes || []}
                      edges={envData.edges || []}
                      currentNodeId={activeStep?.node_id || runDetails.start_node}
                      currentHeading={activeStep?.heading || 0.0}
                      pathTraveled={pathUpToCurrentStep}
                      goalNodeId={runDetails.goal_node}
                    />
                  </div>
                )}

                {/* Scrubber Playback Controls */}
                {replayData?.steps && replayData.steps.length > 0 && (
                  <LiquidCard variant="subtle" className="p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-300">
                        Step {currentStepIdx} / {replayData.steps.length - 1}
                      </span>
                      <span className="text-white font-bold">
                        Location: {activeStep?.node_id}
                      </span>
                    </div>

                    {/* Step slider */}
                    <input
                      type="range"
                      min={0}
                      max={replayData.steps.length - 1}
                      value={currentStepIdx}
                      onChange={(e) => {
                        setIsPlaying(false);
                        setCurrentStepIdx(parseInt(e.target.value));
                      }}
                      className="w-full accent-white"
                    />

                    {/* Playback Buttons */}
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <button
                        onClick={() => setCurrentStepIdx(0)}
                        className="p-2 rounded-lg liquid-glass-interactive text-zinc-300 hover:text-white"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{isPlaying ? "Pause" : "Play Timeline"}</span>
                      </button>
                      <button
                        onClick={() => setCurrentStepIdx(replayData.steps.length - 1)}
                        className="p-2 rounded-lg liquid-glass-interactive text-zinc-300 hover:text-white"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>
                  </LiquidCard>
                )}

                {/* State Snapshot at Selected Step */}
                {activeStep && (
                  <LiquidCard variant="default" className="p-5 space-y-3 text-xs">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold block">
                      Agent State Snapshot at Step #{currentStepIdx}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[9px] text-zinc-500 block">Current Room</span>
                        <span className="font-bold text-white">{activeStep.node_id}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[9px] text-zinc-500 block">Heading</span>
                        <span className="font-bold text-zinc-200">{Math.round(activeStep.heading)}°</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[9px] text-zinc-500 block">Confidence</span>
                        <span className="font-bold text-white">{Math.round(activeStep.confidence * 100)}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[9px] text-zinc-500 block">Uncertainty</span>
                        <span className="font-bold text-zinc-400">{Math.round(activeStep.uncertainty * 100)}%</span>
                      </div>
                    </div>
                  </LiquidCard>
                )}
              </>
            )}
          </div>

        </div>

      </div>
    </AppShell>
  );
}
