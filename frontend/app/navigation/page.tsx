"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import IndoorSimulator3D from "@/components/simulator/IndoorSimulator3D";
import TopDownMap2D from "@/components/simulator/TopDownMap2D";
import LiquidCard from "@/components/ui/LiquidCard";
import {
  startNavigation,
  stepNavigation,
  pauseNavigation,
  resumeNavigation,
  stopNavigation,
  resetNavigation,
  manualIntervention,
  getEnvironments,
  getEnvironmentInstructions,
} from "@/lib/api";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Square,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Eye,
  Layers,
  Activity,
  Terminal,
  Zap,
} from "lucide-react";

export default function NavigationStudioPage() {
  // Environments & Instructions
  const [environments, setEnvironments] = useState<any[]>([]);
  const [selectedEnvId, setSelectedEnvId] = useState<string>("office_floor");
  const [instructions, setInstructions] = useState<any[]>([]);
  const [instructionText, setInstructionText] = useState<string>(
    "Walk straight forward past the reception desk, proceed through the central hub, and enter the executive office."
  );
  const [selectedLang, setSelectedLang] = useState<string>("en");

  // Run & Telemetry State
  const [runId, setRunId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [autoRun, setAutoRun] = useState<boolean>(false);
  const [execSpeed, setExecSpeed] = useState<number>(1000);

  // Agent State
  const [currentNodeId, setCurrentNodeId] = useState<string>("reception");
  const [currentHeading, setCurrentHeading] = useState<number>(0.0);
  const [goalNodeId, setGoalNodeId] = useState<string>("executive_office");
  const [targetWaypoint, setTargetWaypoint] = useState<string | undefined>();
  const [pathTraveled, setPathTraveled] = useState<string[]>(["reception"]);
  const [referencePath, setReferencePath] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<number>(0.95);
  const [uncertaintyLevel, setUncertaintyLevel] = useState<string>("low");
  const [uncertaintySource, setUncertaintySource] = useState<string>("");
  const [suggestedRecovery, setSuggestedRecovery] = useState<string>("");
  const [explanation, setExplanation] = useState<string>(
    "Agent initialized. Ready to execute instruction-conditioned policy."
  );
  const [candidateActions, setCandidateActions] = useState<any[]>([]);
  const [parsedInfo, setParsedInfo] = useState<any>(null);
  const [stepCount, setStepCount] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([
    "System ready. Topological graph and decision policy operational.",
  ]);

  // UI Progressive Disclosure & View Toggles
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [cameraMode, setCameraMode] = useState<"perspective" | "top_down" | "follow">("perspective");
  const [activeRightTab, setActiveRightTab] = useState<"scoring" | "semantics" | "logs">("scoring");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // WebSocket & Timer Refs
  const wsRef = useRef<WebSocket | null>(null);
  const autoRunTimer = useRef<NodeJS.Timeout | null>(null);

  // Initial Load: Environments
  useEffect(() => {
    getEnvironments()
      .then((envs) => {
        setEnvironments(envs);
        if (envs.length > 0) {
          const defaultEnv = envs.find((e) => e.id === "office_floor") || envs[0];
          setSelectedEnvId(defaultEnv.id);
          setCurrentNodeId(defaultEnv.start_node_id || defaultEnv.nodes[0]?.id || "reception");
          setGoalNodeId(defaultEnv.goal_node_ids?.[0] || defaultEnv.nodes[defaultEnv.nodes.length - 1]?.id);
          setPathTraveled([defaultEnv.start_node_id || defaultEnv.nodes[0]?.id || "reception"]);
        }
      })
      .catch((err) => console.error("Error loading environments:", err));
  }, []);

  // Update Instructions on Environment Change
  useEffect(() => {
    if (selectedEnvId) {
      getEnvironmentInstructions(selectedEnvId)
        .then((insts) => {
          setInstructions(insts);
          if (insts.length > 0) {
            setInstructionText(insts[0].instruction);
            setSelectedLang(insts[0].language || "en");
          }
        })
        .catch((err) => console.error("Error loading instructions:", err));

      const env = environments.find((e) => e.id === selectedEnvId);
      if (env) {
        setCurrentNodeId(env.start_node_id || env.nodes[0]?.id || "");
        setGoalNodeId(env.goal_node_ids?.[0] || env.nodes[env.nodes.length - 1]?.id || "");
        setPathTraveled([env.start_node_id || env.nodes[0]?.id || ""]);
      }
    }
  }, [selectedEnvId, environments]);

  // WebSocket Telemetry Connection
  useEffect(() => {
    if (!runId) return;

    const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const wsUrl = base.replace(/^http/, "ws") + `/ws/navigation/${runId}`;
    
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        addLog(`WebSocket connection open [${runId}]`);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const { event: evType, data } = msg;

          if (evType === "candidate_actions") {
            setCandidateActions(data);
          } else if (evType === "uncertainty_detected") {
            setUncertaintyLevel(data.level);
            setUncertaintySource(data.source);
            setSuggestedRecovery(data.recovery);
            addLog(`Uncertainty alert (${data.level}): ${data.source}`);
          } else if (evType === "action_selected") {
            setExplanation(data.explanation || "");
            setConfidence(data.confidence || 0.88);
            addLog(`Decision: ${data.action.type} -> ${data.action.target_node_id || "goal"}`);
          } else if (evType === "movement_completed") {
            setCurrentNodeId(data.current_node_id);
            setCurrentHeading(data.heading || 0.0);
            setPathTraveled(data.path_traveled || []);
            setStepCount(data.step || 0);
          } else if (evType === "navigation_completed") {
            setIsDone(true);
            setSuccess(data.success);
            setMetrics(data.metrics);
            setIsRunning(false);
            addLog(`Navigation completed: ${data.steps} steps. SPL: ${data.metrics?.spl}`);
          } else if (evType === "navigation_failed") {
            setIsDone(true);
            setSuccess(false);
            setIsRunning(false);
            addLog(`Navigation terminated before reaching goal.`);
          }
        } catch (err) {
          console.error("WS Parse error:", err);
        }
      };

      ws.onclose = () => {
        addLog(`WebSocket closed.`);
      };
    } catch (e) {
      console.warn("WebSocket could not connect, falling back to HTTP polling:", e);
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [runId]);

  const addLog = (msg: string) => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 39),
    ]);
  };

  // -------------------------------------------------------------------------
  // Agent Control Handlers
  // -------------------------------------------------------------------------
  const handleStart = async () => {
    try {
      setIsRunning(true);
      setIsPaused(false);
      setIsDone(false);
      setSuccess(false);
      setStepCount(0);
      setLogs([]);
      addLog(`Initializing navigation in '${selectedEnvId}'...`);

      const res = await startNavigation({
        environment_id: selectedEnvId,
        instruction: instructionText,
        language: selectedLang,
      });

      setRunId(res.run_id);
      setCurrentNodeId(res.start_node);
      setGoalNodeId(res.goal_node);
      setReferencePath(res.reference_path || []);
      setPathTraveled([res.start_node]);
      setParsedInfo(res.parsed_instruction);
      setTargetWaypoint(res.parsed_instruction?.ordered_waypoints?.[0] || res.goal_node);
      addLog(`Parsed ${res.language.toUpperCase()} prompt: ${res.parsed_instruction?.landmarks?.length || 0} landmarks grounded.`);
    } catch (err: any) {
      addLog(`Start error: ${err.message}`);
      setIsRunning(false);
    }
  };

  const handleStep = async () => {
    if (!runId) return;
    try {
      const res = await stepNavigation(runId);
      setCurrentNodeId(res.state.current_node_id);
      setCurrentHeading(res.state.current_heading);
      setPathTraveled(res.state.visited_nodes || []);
      setStepCount(res.step);
      setExplanation(res.explanation);
      setConfidence(res.state.confidence || 0.9);
      setUncertaintyLevel(res.uncertainty?.level > 0.4 ? "medium" : "low");
      setUncertaintySource(res.uncertainty?.reasons?.[0] || "");
      setSuggestedRecovery(res.uncertainty?.recommendation || "");
      setCandidateActions(res.candidates || []);
      setMetrics(res.metrics);

      if (res.is_done) {
        setIsDone(true);
        setSuccess(res.success);
        setIsRunning(false);
        setAutoRun(false);
      }
    } catch (err: any) {
      addLog(`Step error: ${err.message}`);
    }
  };

  const handlePause = async () => {
    if (!runId) return;
    await pauseNavigation(runId);
    setIsPaused(true);
    setAutoRun(false);
    addLog(`Execution paused.`);
  };

  const handleResume = async () => {
    if (!runId) return;
    await resumeNavigation(runId);
    setIsPaused(false);
    addLog(`Execution resumed.`);
  };

  const handleStop = async () => {
    if (!runId) return;
    const res = await stopNavigation(runId);
    setIsRunning(false);
    setAutoRun(false);
    setIsDone(true);
    setMetrics(res.metrics);
    addLog(`Execution halted.`);
  };

  const handleReset = async () => {
    if (!runId) return;
    await resetNavigation(runId);
    setIsRunning(false);
    setIsPaused(false);
    setAutoRun(false);
    setIsDone(false);
    setStepCount(0);
    const env = environments.find((e) => e.id === selectedEnvId);
    if (env) {
      setCurrentNodeId(env.start_node_id || env.nodes[0]?.id || "");
      setPathTraveled([env.start_node_id || env.nodes[0]?.id || ""]);
    }
    addLog(`Simulator reset.`);
  };

  const handleIntervention = async (targetNode: string) => {
    if (!runId) return;
    try {
      addLog(`Human intervention: Forcing step -> '${targetNode}'`);
      await manualIntervention(runId, "move_to_node", targetNode);
      setCurrentNodeId(targetNode);
      setPathTraveled((prev) => [...prev, targetNode]);
    } catch (err: any) {
      addLog(`Intervention error: ${err.message}`);
    }
  };

  // Auto-Runner
  useEffect(() => {
    if (autoRun && isRunning && !isPaused && !isDone && runId) {
      autoRunTimer.current = setInterval(() => {
        handleStep();
      }, execSpeed);
    } else {
      if (autoRunTimer.current) clearInterval(autoRunTimer.current);
    }
    return () => {
      if (autoRunTimer.current) clearInterval(autoRunTimer.current);
    };
  }, [autoRun, isRunning, isPaused, isDone, runId, execSpeed]);

  const currentEnv = environments.find((e) => e.id === selectedEnvId);
  const nodes = currentEnv?.nodes || [];
  const edges = currentEnv?.edges || [];

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-[calc(100vh-56px)] overflow-hidden bg-black text-white relative">
        
        {/* Floating Top Control Island */}
        <div className="h-13 border-b border-white/[0.08] backdrop-blur-2xl bg-black/60 px-5 flex items-center justify-between text-xs shrink-0">
          
          {/* Active Target Metadata */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              <span className="font-display font-semibold text-white tracking-tight">
                {currentEnv?.name || selectedEnvId}
              </span>
            </div>
            <span className="text-white/20">/</span>
            <span className="font-mono text-[11px] text-zinc-400">
              TARGET: <span className="text-white font-semibold">{goalNodeId}</span>
            </span>
          </div>

          {/* View Mode & Camera Toggles */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg liquid-glass-subtle p-0.5">
              <button
                onClick={() => setViewMode("3d")}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                  viewMode === "3d"
                    ? "bg-white text-black shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                3D Simulator
              </button>
              <button
                onClick={() => setViewMode("2d")}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                  viewMode === "2d"
                    ? "bg-white text-black shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                2D Map
              </button>
            </div>

            {viewMode === "3d" && (
              <div className="hidden sm:flex items-center rounded-lg liquid-glass-subtle p-0.5">
                {[
                  { id: "perspective", label: "Perspective" },
                  { id: "top_down", label: "Top-Down" },
                  { id: "follow", label: "Follow Agent" },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setCameraMode(cam.id as any)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                      cameraMode === cam.id
                        ? "bg-white/10 text-white font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3-Column Studio Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* ============================================================= */}
          {/* LEFT PANEL: Clean Instruction & Execution Controls */}
          {/* ============================================================= */}
          <div className="w-full lg:w-80 border-r border-white/[0.08] bg-black/80 backdrop-blur-2xl flex flex-col p-5 overflow-y-auto space-y-5 shrink-0">
            
            {/* Language Selection Tabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
                  Instruction Language
                </span>
                <span className="text-[10px] font-mono text-zinc-400">RxR</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl liquid-glass-subtle">
                {[
                  { code: "en", label: "English" },
                  { code: "hi", label: "हिन्दी" },
                  { code: "es", label: "Español" },
                ].map((l) => (
                  <button
                    key={l.code}
                    disabled={isRunning}
                    onClick={() => setSelectedLang(l.code)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all ${
                      selectedLang === l.code
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Instruction Input */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold block">
                Natural-Language Goal
              </span>
              <textarea
                value={instructionText}
                disabled={isRunning}
                onChange={(e) => setInstructionText(e.target.value)}
                rows={3}
                placeholder="Type instruction in English, Hindi, or Spanish..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/30 transition-all resize-none font-light leading-relaxed"
              />
            </div>

            {/* Sample Presets Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold block">
                Preset Instructions ({selectedLang.toUpperCase()})
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {instructions
                  .filter((inst) => inst.language === selectedLang)
                  .map((inst) => (
                    <button
                      key={inst.id}
                      disabled={isRunning}
                      onClick={() => setInstructionText(inst.instruction)}
                      className="w-full text-left p-2.5 rounded-lg liquid-glass-interactive text-[11px] text-zinc-300 hover:text-white transition-all truncate block group"
                      title={inst.instruction}
                    >
                      <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block">
                        {inst.title || inst.category}
                      </span>
                      <span className="truncate block font-light">{inst.instruction}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Primary Action Controls */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2.5">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Navigation</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {isPaused ? (
                    <button
                      onClick={handleResume}
                      className="py-2.5 rounded-xl liquid-glass-interactive border-white/30 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePause}
                      className="py-2.5 rounded-xl liquid-glass-interactive text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Pause className="w-3 h-3" />
                      <span>Pause</span>
                    </button>
                  )}
                  <button
                    onClick={handleStop}
                    className="py-2.5 rounded-xl liquid-glass-interactive text-zinc-400 hover:text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Halt</span>
                  </button>
                </div>
              )}

              {/* Step By Step & Auto Controls */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleStep}
                  disabled={!isRunning || isDone}
                  className="py-2 rounded-xl liquid-glass-interactive disabled:opacity-30 text-xs text-white font-medium flex items-center justify-center gap-1.5"
                >
                  <FastForward className="w-3.5 h-3.5 opacity-80" />
                  <span>Step</span>
                </button>
                <button
                  onClick={() => setAutoRun(!autoRun)}
                  disabled={!isRunning || isDone}
                  className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    autoRun
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "liquid-glass-interactive text-zinc-300"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{autoRun ? "Auto: ON" : "Auto: OFF"}</span>
                </button>
              </div>

              {/* Reset Action */}
              <button
                onClick={handleReset}
                className="w-full py-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset State</span>
              </button>
            </div>

            {/* Progressive Disclosure: Advanced Drawer */}
            <div className="pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-[11px] font-mono text-zinc-500 hover:text-zinc-300 py-1"
              >
                <span>ADVANCED SETTINGS</span>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvanced && (
                <div className="pt-3 space-y-3 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                      Environment Topology
                    </label>
                    <select
                      value={selectedEnvId}
                      disabled={isRunning}
                      onChange={(e) => setSelectedEnvId(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
                    >
                      {environments.map((env) => (
                        <option key={env.id} value={env.id} className="bg-zinc-900">
                          {env.name} ({env.node_count} nodes)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                      <span>Execution Pace</span>
                      <span>{execSpeed}ms</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[1500, 1000, 500].map((spd, i) => (
                        <button
                          key={spd}
                          onClick={() => setExecSpeed(spd)}
                          className={`py-1 rounded text-[10px] font-mono ${
                            execSpeed === spd ? "bg-white text-black font-semibold" : "liquid-glass-subtle text-zinc-400"
                          }`}
                        >
                          {i === 0 ? "0.5x" : i === 1 ? "1x" : "2x"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Intervention Override */}
                  {isRunning && (
                    <div className="p-2.5 rounded-xl liquid-glass-subtle space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                        Direct Node Override
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {nodes
                          .filter((n: any) => n.id !== currentNodeId)
                          .map((n: any) => (
                            <button
                              key={n.id}
                              onClick={() => handleIntervention(n.id)}
                              className="px-2 py-0.5 rounded liquid-glass-interactive text-[10px] text-zinc-300"
                            >
                              {n.id}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* ============================================================= */}
          {/* CENTER: 3D Simulator / 2D Map Digital Twin */}
          {/* ============================================================= */}
          <div className="flex-1 flex flex-col relative bg-black min-h-[420px]">
            {viewMode === "3d" ? (
              <IndoorSimulator3D
                nodes={nodes}
                edges={edges}
                currentNodeId={currentNodeId}
                currentHeading={currentHeading}
                pathTraveled={pathTraveled}
                referencePath={referencePath}
                goalNodeId={goalNodeId}
                targetWaypoint={targetWaypoint}
                cameraMode={cameraMode}
              />
            ) : (
              <TopDownMap2D
                nodes={nodes}
                edges={edges}
                currentNodeId={currentNodeId}
                currentHeading={currentHeading}
                pathTraveled={pathTraveled}
                referencePath={referencePath}
                goalNodeId={goalNodeId}
                targetWaypoint={targetWaypoint}
                onSelectNode={(nid) => handleIntervention(nid)}
              />
            )}

            {/* Bottom HUD Floating Overlay */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-none">
              
              <div className="pointer-events-auto flex items-center gap-3 liquid-glass-elevated px-4 py-2 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-mono text-[10px]">ROOM</span>
                  <span className="font-mono font-semibold text-white">{currentNodeId}</span>
                </div>
                <span className="text-white/15">/</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-mono text-[10px]">HEADING</span>
                  <span className="font-mono text-zinc-300">{Math.round(currentHeading)}°</span>
                </div>
                <span className="text-white/15">/</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-mono text-[10px]">STEP</span>
                  <span className="font-mono text-white font-bold">{stepCount}</span>
                </div>
              </div>

              {/* Goal Reached Notification */}
              {isDone && (
                <div
                  className={`pointer-events-auto px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 liquid-glass-elevated ${
                    success
                      ? "border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.25)]"
                      : "border-red-500/30 text-zinc-300"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {success ? "DESTINATION REACHED — EPISODE SUCCESS" : "NAVIGATION HALTED BEFORE GOAL"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================= */}
          {/* RIGHT PANEL: Agent Intelligence & Progressive Disclosure */}
          {/* ============================================================= */}
          <div className="w-full lg:w-96 border-l border-white/[0.08] bg-black/80 backdrop-blur-2xl flex flex-col p-5 overflow-y-auto space-y-4 shrink-0">
            
            {/* Status & Confidence Card */}
            <LiquidCard variant="subtle" className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
                  Policy Status
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase border border-white/15 bg-white/5 text-zinc-300">
                  {isDone ? (success ? "Goal Attained" : "Halted") : isRunning ? (isPaused ? "Paused" : "Navigating") : "Idle"}
                </span>
              </div>

              {/* Confidence Progress Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Decision Confidence</span>
                  <span className="text-white font-bold">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-300"
                    style={{ width: `${Math.round(confidence * 100)}%` }}
                  />
                </div>
              </div>
            </LiquidCard>

            {/* Uncertainty Warning */}
            {uncertaintyLevel !== "low" && uncertaintySource && (
              <div className="p-3.5 rounded-xl liquid-glass border-amber-500/30 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Ambiguity Warning</span>
                </div>
                <p className="text-[11px] text-zinc-300">{uncertaintySource}</p>
                {suggestedRecovery && (
                  <span className="text-[10px] text-zinc-400 font-mono block">
                    Recovery: {suggestedRecovery}
                  </span>
                )}
              </div>
            )}

            {/* Grounded Decision Explanation */}
            <LiquidCard variant="default" className="p-4 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold block">
                Grounded Decision Justification
              </span>
              <p className="text-xs text-zinc-200 leading-relaxed font-light italic pl-3 border-l border-white/30">
                "{explanation}"
              </p>
            </LiquidCard>

            {/* Tabbed Technical Deep-Dive */}
            <div className="space-y-3">
              <div className="flex rounded-xl p-0.5 liquid-glass-subtle">
                {[
                  { id: "scoring", label: "Scoring" },
                  { id: "semantics", label: "Semantics" },
                  { id: "logs", label: "Logs" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveRightTab(tab.id as any)}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all ${
                      activeRightTab === tab.id
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Candidate Actions & Scores */}
              {activeRightTab === "scoring" && (
                <div className="space-y-2 animate-fade-in">
                  {candidateActions.length > 0 ? (
                    candidateActions.map((cand, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-[11px] space-y-1 ${
                          idx === 0
                            ? "liquid-glass-elevated border-white/20"
                            : "liquid-glass-subtle opacity-70"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-white">
                            {cand.action?.type || cand.action_type} {cand.action?.target_node_id || cand.target_node ? `→ ${cand.action?.target_node_id || cand.target_node}` : ""}
                          </span>
                          <span className="font-mono text-zinc-300 font-bold">
                            Score: {cand.total_score ?? cand.score}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-light">
                          {cand.explanation}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-zinc-500 font-light">
                      No candidate scores for idle state.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Semantic Parse */}
              {activeRightTab === "semantics" && (
                <div className="p-4 rounded-xl liquid-glass-subtle space-y-3 text-xs font-mono animate-fade-in">
                  {parsedInfo ? (
                    <div className="space-y-2 text-zinc-300">
                      <div><span className="text-zinc-500">Language:</span> <span className="text-white uppercase">{parsedInfo.language}</span></div>
                      <div><span className="text-zinc-500">Initial Direction:</span> <span className="text-zinc-200">{parsedInfo.initial_direction || "forward"}</span></div>
                      <div>
                        <span className="text-zinc-500 block mb-1">Target Landmarks:</span>
                        <div className="flex flex-wrap gap-1">
                          {parsedInfo.landmarks?.map((lm: string) => (
                            <span key={lm} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-200">
                              {lm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-zinc-500 font-light font-sans text-xs">
                      Instruction not parsed yet.
                    </span>
                  )}
                </div>
              )}

              {/* Tab 3: Execution Telemetry Logs */}
              {activeRightTab === "logs" && (
                <div className="h-44 p-3 rounded-xl bg-black/60 border border-white/10 overflow-y-auto space-y-1 font-mono text-[10px] text-zinc-400 animate-fade-in">
                  {logs.map((lg, i) => (
                    <div key={i} className="truncate">{lg}</div>
                  ))}
                </div>
              )}
            </div>

            {/* RxR Live Evaluation Metrics */}
            {metrics && (
              <LiquidCard variant="subtle" className="p-4 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold block">
                  RxR Episode Metrics
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                    <span className="text-[9px] text-zinc-500 block">SPL</span>
                    <span className="text-sm font-bold text-white">{metrics.spl}</span>
                  </div>
                  <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                    <span className="text-[9px] text-zinc-500 block">Nav Error</span>
                    <span className="text-sm font-bold text-zinc-300">{metrics.navigation_error}m</span>
                  </div>
                  <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                    <span className="text-[9px] text-zinc-500 block">nDTW</span>
                    <span className="text-sm font-bold text-zinc-200">{metrics.ndtw}</span>
                  </div>
                  <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                    <span className="text-[9px] text-zinc-500 block">SDTW</span>
                    <span className="text-sm font-bold text-white">{metrics.sdtw}</span>
                  </div>
                </div>
              </LiquidCard>
            )}

          </div>
        </div>

        {/* Bottom Floating Path Scrubber Timeline */}
        <div className="h-14 border-t border-white/[0.08] backdrop-blur-2xl bg-black/80 px-6 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-3 overflow-x-auto py-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold shrink-0">
              Trajectory ({pathTraveled.length})
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {pathTraveled.map((stepNode, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg liquid-glass-subtle text-[11px] whitespace-nowrap">
                    <span className="font-mono text-[9px] text-zinc-500">#{idx}</span>
                    <span className="font-medium text-white">{stepNode}</span>
                  </div>
                  {idx < pathTraveled.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-white/20 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-zinc-500">
            <span>RXR DECISION AGENT · REAL-TIME STREAM</span>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
