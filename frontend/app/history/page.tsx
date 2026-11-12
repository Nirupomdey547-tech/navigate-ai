"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import TopDownMap2D from "@/components/simulator/TopDownMap2D";
import { getHistory, getRunDetails, getRunReplay, getEnvironment } from "@/lib/api";
import {
  History,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Compass,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sliders,
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
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#63E6D1]/10 text-[#63E6D1] border border-[#63E6D1]/20">
                RUN INSPECTOR
              </span>
              <span className="text-xs text-[#929DA5]">Audit Decision History & State Transitions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Navigation History & Run Inspector
            </h1>
            <p className="text-sm text-[#929DA5] mt-1 max-w-2xl">
              Inspect past navigation episodes step-by-step. Replay agent trajectories, review decision rationales, confidence scores, and uncertainty states.
            </p>
          </div>
        </div>

        {/* 2-Column: Left Runs List, Right Step-by-Step Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Runs List */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#929DA5] uppercase tracking-wider block">
              Recorded Navigation Episodes ({runs.length})
            </span>

            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {runs.map((r) => (
                <button
                  key={r.id}
                  onClick={() => selectRun(r.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedRunId === r.id
                      ? "bg-[#63E6D1]/10 border-[#63E6D1] shadow-md shadow-[#63E6D1]/10"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#63E6D1]">
                      Run #{r.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        r.success === 1
                          ? "bg-[#7EE2A8]/20 text-[#7EE2A8]"
                          : "bg-[#FF7777]/20 text-[#FF7777]"
                      }`}
                    >
                      {r.success === 1 ? "Success" : "Failed"}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white/90 truncate">{r.environment_id}</h4>
                  <p className="text-[11px] text-[#929DA5] line-clamp-2 mt-0.5 leading-snug">
                    {r.instruction}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-[#929DA5] font-mono">
                    <span className="uppercase">{r.language || "en"}</span>
                    <span>{r.steps} steps</span>
                    {r.metrics?.spl && <span className="text-[#82B9FF]">SPL: {r.metrics.spl}</span>}
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
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-[#63E6D1] uppercase font-bold">
                        Episode Trace #{runDetails.id} • {runDetails.environment_id}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{runDetails.instruction}</h3>
                    </div>
                    {runDetails.metrics && (
                      <div className="flex gap-2 font-mono text-xs">
                        <div className="bg-white/5 px-2.5 py-1 rounded">
                          <span className="text-[9px] text-[#929DA5] block">SPL</span>
                          <span className="font-bold text-[#63E6D1]">{runDetails.metrics.spl}</span>
                        </div>
                        <div className="bg-white/5 px-2.5 py-1 rounded">
                          <span className="text-[9px] text-[#929DA5] block">SR</span>
                          <span className="font-bold text-[#7EE2A8]">{runDetails.success ? "100%" : "0%"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2D Topological Replay Viewer */}
                {envData && (
                  <div className="h-80 rounded-2xl border border-white/[0.08] overflow-hidden relative">
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
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">
                        Timeline Step {currentStepIdx} of {replayData.steps.length - 1}
                      </span>
                      <span className="font-mono text-[#63E6D1]">
                        Node: {activeStep?.node_id}
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
                      className="w-full accent-[#63E6D1]"
                    />

                    {/* Playback Buttons */}
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <button
                        onClick={() => setCurrentStepIdx(0)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#63E6D1] to-[#82B9FF] text-[#0A0D10] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#63E6D1]/20"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                        <span>{isPlaying ? "Pause" : "Play Replay"}</span>
                      </button>
                      <button
                        onClick={() => setCurrentStepIdx(replayData.steps.length - 1)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* State Snapshot at Selected Step */}
                {activeStep && (
                  <div className="p-4 rounded-2xl bg-[#10161B] border border-white/[0.08] space-y-2 text-xs">
                    <span className="text-[10px] font-semibold text-[#82B9FF] uppercase tracking-wider block">
                      Agent State Snapshot at Step #{currentStepIdx}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="p-2 rounded bg-white/5">
                        <span className="text-[10px] text-[#929DA5] block">Current Node</span>
                        <span className="font-bold text-[#63E6D1]">{activeStep.node_id}</span>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <span className="text-[10px] text-[#929DA5] block">Heading</span>
                        <span className="font-bold text-white">{Math.round(activeStep.heading)}°</span>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <span className="text-[10px] text-[#929DA5] block">Confidence</span>
                        <span className="font-bold text-[#7EE2A8]">{Math.round(activeStep.confidence * 100)}%</span>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <span className="text-[10px] text-[#929DA5] block">Uncertainty</span>
                        <span className="font-bold text-[#F5C66B]">{Math.round(activeStep.uncertainty * 100)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
