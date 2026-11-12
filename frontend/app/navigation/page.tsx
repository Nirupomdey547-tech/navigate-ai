"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import IndoorSimulator3D from "@/components/simulator/IndoorSimulator3D";
import TopDownMap2D from "@/components/simulator/TopDownMap2D";
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
  Layers,
  Eye,
  MapPin,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
} from "lucide-react";

export default function NavigationStudioPage() {
  // Environments and Instructions
  const [environments, setEnvironments] = useState<any[]>([]);
  const [selectedEnvId, setSelectedEnvId] = useState<string>("office_floor");
  const [instructions, setInstructions] = useState<any[]>([]);
  const [instructionText, setInstructionText] = useState<string>(
    "Walk straight forward past the reception desk, proceed through the central hub, and enter the executive office."
  );
  const [selectedLang, setSelectedLang] = useState<string>("en");

  // Run & State Tracking
  const [runId, setRunId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [autoRun, setAutoRun] = useState<boolean>(false);
  const [execSpeed, setExecSpeed] = useState<number>(1000); // ms per step

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
    "Agent is ready. Select an instruction or start navigation."
  );
  const [candidateActions, setCandidateActions] = useState<any[]>([]);
  const [parsedInfo, setParsedInfo] = useState<any>(null);
  const [stepCount, setStepCount] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([
    "System ready. Models and environments loaded.",
  ]);

  // View Options
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [cameraMode, setCameraMode] = useState<"perspective" | "top_down" | "follow">("perspective");

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);
  const autoRunTimer = useRef<NodeJS.Timeout | null>(null);

  // Load environments on mount
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

  // Load sample instructions when environment changes
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

  // Connect WebSocket when runId changes
  useEffect(() => {
    if (!runId) return;

    const wsUrl = `ws://127.0.0.1:8000/ws/navigation/${runId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      addLog(`WebSocket streaming connection established for [${runId}]`);
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
          addLog(`⚠ Uncertainty detected (${data.level}): ${data.source}`);
        } else if (evType === "action_selected") {
          setExplanation(data.explanation || "");
          setConfidence(data.confidence || 0.85);
          addLog(`Decision: ${data.action.type} -> ${data.action.target_node_id || "destination"}`);
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
          addLog(`✔ Navigation completed successfully in ${data.steps} steps! SPL: ${data.metrics?.spl}`);
        } else if (evType === "navigation_failed") {
          setIsDone(true);
          setSuccess(false);
          setIsRunning(false);
          addLog(`✖ Navigation terminated before goal.`);
        }
      } catch (err) {
        console.error("WS Parse error:", err);
      }
    };

    ws.onclose = () => {
      addLog(`WebSocket connection closed.`);
    };

    return () => {
      ws.close();
    };
  }, [runId]);

  const addLog = (msg: string) => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 49),
    ]);
  };

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleStart = async () => {
    try {
      setIsRunning(true);
      setIsPaused(false);
      setIsDone(false);
      setSuccess(false);
      setStepCount(0);
      setLogs([]);
      addLog(`Starting navigation episode in '${selectedEnvId}'...`);

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
      addLog(`Instruction parsed (${res.language}): ${res.parsed_instruction?.landmarks?.length || 0} landmarks detected.`);
    } catch (err: any) {
      addLog(`Error starting navigation: ${err.message}`);
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
    addLog(`Navigation paused by user.`);
  };

  const handleResume = async () => {
    if (!runId) return;
    await resumeNavigation(runId);
    setIsPaused(false);
    addLog(`Navigation resumed.`);
  };

  const handleStop = async () => {
    if (!runId) return;
    const res = await stopNavigation(runId);
    setIsRunning(false);
    setAutoRun(false);
    setIsDone(true);
    setMetrics(res.metrics);
    addLog(`Navigation manually stopped.`);
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
    addLog(`Environment state reset.`);
  };

  const handleIntervention = async (targetNode: string) => {
    if (!runId) return;
    try {
      addLog(`Human intervention: Overriding next action towards '${targetNode}'`);
      await manualIntervention(runId, "move_to_node", targetNode);
      setCurrentNodeId(targetNode);
      setPathTraveled((prev) => [...prev, targetNode]);
    } catch (err: any) {
      addLog(`Intervention error: ${err.message}`);
    }
  };

  // Auto-runner loop
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
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Top Studio Control Bar */}
        <div className="h-12 border-b border-white/[0.08] bg-[#0A0D10]/90 backdrop-blur-md px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white/90 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#63E6D1]" />
              Navigation Studio
            </span>
            <span className="text-white/20">|</span>
            <span className="text-[#929DA5]">
              Environment: <span className="text-white font-medium">{currentEnv?.name || selectedEnvId}</span>
            </span>
            <span className="text-white/20">|</span>
            <span className="text-[#929DA5]">
              Goal: <span className="text-[#FF7777] font-medium">{goalNodeId}</span>
            </span>
          </div>

          {/* View Mode & Camera Toggles */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.08]">
              <button
                onClick={() => setViewMode("3d")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  viewMode === "3d" ? "bg-[#63E6D1]/20 text-[#63E6D1]" : "text-[#929DA5] hover:text-white"
                }`}
              >
                3D Simulator
              </button>
              <button
                onClick={() => setViewMode("2d")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  viewMode === "2d" ? "bg-[#63E6D1]/20 text-[#63E6D1]" : "text-[#929DA5] hover:text-white"
                }`}
              >
                2D Map Fallback
              </button>
            </div>

            {viewMode === "3d" && (
              <div className="hidden sm:flex items-center rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.08]">
                <button
                  onClick={() => setCameraMode("perspective")}
                  className={`px-2 py-1 rounded text-[10px] ${
                    cameraMode === "perspective" ? "bg-white/10 text-white" : "text-[#929DA5]"
                  }`}
                >
                  Perspective
                </button>
                <button
                  onClick={() => setCameraMode("top_down")}
                  className={`px-2 py-1 rounded text-[10px] ${
                    cameraMode === "top_down" ? "bg-white/10 text-white" : "text-[#929DA5]"
                  }`}
                >
                  Top-Down
                </button>
                <button
                  onClick={() => setCameraMode("follow")}
                  className={`px-2 py-1 rounded text-[10px] ${
                    cameraMode === "follow" ? "bg-white/10 text-white" : "text-[#929DA5]"
                  }`}
                >
                  Follow Agent
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3-Column Layout: Left Controls, Center Simulator, Right Agent Insights */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* ============================================================= */}
          {/* LEFT SIDEBAR: Instructions & Execution Controls */}
          {/* ============================================================= */}
          <div className="w-full lg:w-80 border-r border-white/[0.08] bg-[#0A0D10]/95 flex flex-col p-4 overflow-y-auto space-y-4">
            {/* Environment Picker */}
            <div>
              <label className="text-[11px] font-semibold text-[#929DA5] uppercase tracking-wider block mb-1.5">
                Select Environment
              </label>
              <select
                value={selectedEnvId}
                disabled={isRunning}
                onChange={(e) => setSelectedEnvId(e.target.value)}
                className="w-full bg-[#10161B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#63E6D1] transition-colors"
              >
                {environments.map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.name} ({env.node_count} nodes)
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-[#929DA5] uppercase tracking-wider">
                  Instruction Language
                </label>
                <span className="text-[10px] text-[#63E6D1] font-mono">RxR Multilingual</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { code: "en", label: "English" },
                  { code: "hi", label: "हिन्दी (Hindi)" },
                  { code: "es", label: "Español" },
                ].map((l) => (
                  <button
                    key={l.code}
                    disabled={isRunning}
                    onClick={() => setSelectedLang(l.code)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center border transition-all ${
                      selectedLang === l.code
                        ? "bg-[#63E6D1]/20 border-[#63E6D1] text-[#63E6D1]"
                        : "bg-[#10161B] border-white/10 text-[#929DA5] hover:text-white"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Natural-Language Instruction Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-[#929DA5] uppercase tracking-wider">
                  Navigation Instruction
                </label>
              </div>
              <textarea
                value={instructionText}
                disabled={isRunning}
                onChange={(e) => setInstructionText(e.target.value)}
                rows={3}
                placeholder="Enter natural language navigation instructions..."
                className="w-full bg-[#10161B] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#63E6D1] transition-colors resize-none"
              />
            </div>

            {/* Sample Preset Instruction Chips */}
            <div>
              <label className="text-[10px] text-[#929DA5] uppercase tracking-wider block mb-1">
                Sample Presets ({selectedLang})
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {instructions
                  .filter((inst) => inst.language === selectedLang)
                  .map((inst) => (
                    <button
                      key={inst.id}
                      disabled={isRunning}
                      onClick={() => setInstructionText(inst.instruction)}
                      className="w-full text-left p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-[11px] text-[#F4F7F8] hover:text-[#63E6D1] transition-all truncate block"
                      title={inst.instruction}
                    >
                      <span className="font-semibold block text-[10px] text-[#82B9FF]">
                        {inst.title || inst.category}
                      </span>
                      {inst.instruction}
                    </button>
                  ))}
              </div>
            </div>

            {/* Main Navigation Execution Controls */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <label className="text-[11px] font-semibold text-[#929DA5] uppercase tracking-wider block">
                Execution Controls
              </label>

              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#63E6D1] to-[#82B9FF] text-[#0A0D10] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#63E6D1]/20 hover:opacity-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Navigation</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {isPaused ? (
                    <button
                      onClick={handleResume}
                      className="py-2 rounded-lg bg-[#7EE2A8]/20 border border-[#7EE2A8] text-[#7EE2A8] text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePause}
                      className="py-2 rounded-lg bg-[#F5C66B]/20 border border-[#F5C66B] text-[#F5C66B] text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </button>
                  )}
                  <button
                    onClick={handleStop}
                    className="py-2 rounded-lg bg-[#FF7777]/20 border border-[#FF7777] text-[#FF7777] text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </button>
                </div>
              )}

              {/* Step By Step & Auto Mode */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleStep}
                  disabled={!isRunning || isDone}
                  className="py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 border border-white/10 text-xs text-white font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <FastForward className="w-3.5 h-3.5 text-[#63E6D1]" />
                  <span>Step Once</span>
                </button>
                <button
                  onClick={() => setAutoRun(!autoRun)}
                  disabled={!isRunning || isDone}
                  className={`py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                    autoRun
                      ? "bg-[#63E6D1]/20 border-[#63E6D1] text-[#63E6D1]"
                      : "bg-white/[0.06] border-white/10 text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{autoRun ? "Auto: ON" : "Auto: OFF"}</span>
                </button>
              </div>

              {/* Execution Speed Slider */}
              <div className="flex items-center justify-between text-[11px] text-[#929DA5] pt-1">
                <span>Speed: {execSpeed === 500 ? "2x Fast" : execSpeed === 1000 ? "1x Normal" : "0.5x Slow"}</span>
                <div className="flex gap-1">
                  {[1500, 1000, 500].map((spd, i) => (
                    <button
                      key={spd}
                      onClick={() => setExecSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        execSpeed === spd ? "bg-[#63E6D1] text-[#0A0D10] font-bold" : "bg-white/5 text-white/60"
                      }`}
                    >
                      {i === 0 ? "0.5x" : i === 1 ? "1x" : "2x"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Environment */}
              <button
                onClick={handleReset}
                className="w-full py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#929DA5] text-[11px] flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Environment</span>
              </button>
            </div>

            {/* Manual Intervention Override */}
            {isRunning && (
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                <span className="text-[10px] font-bold text-[#F5C66B] uppercase tracking-wider block">
                  Manual Action Override
                </span>
                <p className="text-[10px] text-[#929DA5]">
                  Directly command the agent to force a transition:
                </p>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {nodes
                    .filter((n: any) => n.id !== currentNodeId)
                    .map((n: any) => (
                      <button
                        key={n.id}
                        onClick={() => handleIntervention(n.id)}
                        className="px-2 py-1 rounded bg-[#10161B] hover:bg-[#63E6D1]/20 border border-white/10 hover:border-[#63E6D1] text-[10px] text-white/80"
                      >
                        {n.id}
                      </button>
                    ))}

                </div>
              </div>
            )}
          </div>

          {/* ============================================================= */}
          {/* CENTER: 3D Simulator / 2D Map */}
          {/* ============================================================= */}
          <div className="flex-1 flex flex-col relative bg-[#070A0D] min-h-[400px]">
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

            {/* Bottom Status Ribbon Overlay on Canvas */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-3 bg-[#0A0D10]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#929DA5]">Node:</span>
                  <span className="font-mono font-semibold text-[#63E6D1]">{currentNodeId}</span>
                </div>
                <span className="text-white/20">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#929DA5]">Heading:</span>
                  <span className="font-mono text-white">{Math.round(currentHeading)}°</span>
                </div>
                <span className="text-white/20">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#929DA5]">Steps:</span>
                  <span className="font-mono text-[#82B9FF]">{stepCount}</span>
                </div>
              </div>

              {/* Task Completion Banner */}
              {isDone && (
                <div
                  className={`pointer-events-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl ${
                    success
                      ? "bg-[#7EE2A8]/20 border border-[#7EE2A8] text-[#7EE2A8]"
                      : "bg-[#FF7777]/20 border border-[#FF7777] text-[#FF7777]"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {success ? "GOAL REACHED — TASK SUCCEEDED" : "NAVIGATION HALTED BEFORE GOAL"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================= */}
          {/* RIGHT SIDEBAR: Agent State, Decision Evidence, Uncertainty */}
          {/* ============================================================= */}
          <div className="w-full lg:w-96 border-l border-white/[0.08] bg-[#0A0D10]/95 flex flex-col p-4 overflow-y-auto space-y-4">
            {/* Agent Status Badge & Confidence Bar */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#929DA5] uppercase tracking-wider">
                  Agent Status
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    isDone
                      ? success
                        ? "bg-[#7EE2A8]/20 text-[#7EE2A8]"
                        : "bg-[#FF7777]/20 text-[#FF7777]"
                      : isRunning
                      ? "bg-[#63E6D1]/20 text-[#63E6D1]"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  {isDone ? (success ? "Completed" : "Failed") : isRunning ? (isPaused ? "Paused" : "Navigating") : "Idle"}
                </span>
              </div>

              {/* Decision Confidence Progress Meter */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#929DA5]">Decision Confidence</span>
                  <span className="font-mono font-bold text-[#63E6D1]">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#63E6D1] to-[#82B9FF] transition-all duration-300"
                    style={{ width: `${Math.round(confidence * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Uncertainty Warning Box */}
            {uncertaintyLevel !== "low" && uncertaintySource && (
              <div className="p-3 rounded-xl bg-[#F5C66B]/10 border border-[#F5C66B]/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5C66B]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Uncertainty Alert ({uncertaintyLevel.toUpperCase()})</span>
                </div>
                <p className="text-[11px] text-[#F5C66B]/90">{uncertaintySource}</p>
                {suggestedRecovery && (
                  <span className="text-[10px] text-white/70 block font-mono">
                    Recovery Strategy: {suggestedRecovery}
                  </span>
                )}
              </div>
            )}

            {/* Grounded Decision Explanation */}
            <div className="p-3 rounded-xl bg-[#10161B] border border-white/[0.08] space-y-1.5">
              <span className="text-[10px] font-semibold text-[#63E6D1] uppercase tracking-wider block">
                Grounded Decision Explanation
              </span>
              <p className="text-xs text-white/90 leading-relaxed font-sans">{explanation}</p>
            </div>

            {/* Instruction Interpretation */}
            {parsedInfo && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs">
                <span className="text-[10px] font-semibold text-[#82B9FF] uppercase tracking-wider block">
                  Instruction Interpretation
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#929DA5] block text-[10px]">Detected Language</span>
                    <span className="font-mono text-white font-medium uppercase">
                      {parsedInfo.language}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#929DA5] block text-[10px]">Initial Direction</span>
                    <span className="font-mono text-white font-medium capitalize">
                      {parsedInfo.initial_direction || "forward"}
                    </span>
                  </div>
                </div>

                {parsedInfo.landmarks?.length > 0 && (
                  <div>
                    <span className="text-[#929DA5] block text-[10px] mb-1">Extracted Landmarks</span>
                    <div className="flex flex-wrap gap-1">
                      {parsedInfo.landmarks.map((lm: string) => (
                        <span
                          key={lm}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-[#63E6D1]"
                        >
                          {lm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Candidate Actions & Scoring Breakdown */}
            {candidateActions.length > 0 && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs">
                <span className="text-[10px] font-semibold text-[#929DA5] uppercase tracking-wider block">
                  Action Policy Scoring Breakdown
                </span>
                <div className="space-y-1.5">
                  {candidateActions.map((cand, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-[11px] ${
                        idx === 0
                          ? "bg-[#63E6D1]/10 border-[#63E6D1]/40"
                          : "bg-white/[0.02] border-white/5 opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono font-semibold text-white">
                          {cand.action?.type || cand.action_type} {cand.action?.target_node_id || cand.target_node ? `→ ${cand.action?.target_node_id || cand.target_node}` : ""}
                        </span>
                        <span className="font-mono text-[10px] text-[#63E6D1] font-bold">
                          Score: {cand.total_score ?? cand.score}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#929DA5] leading-tight">
                        {cand.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Navigation Metrics Summary */}
            {metrics && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs">
                <span className="text-[10px] font-semibold text-[#7EE2A8] uppercase tracking-wider block">
                  RxR Benchmark Metrics
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-[10px] text-[#929DA5] block">SPL</span>
                    <span className="text-sm font-bold text-[#63E6D1]">{metrics.spl}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-[10px] text-[#929DA5] block">Nav Error</span>
                    <span className="text-sm font-bold text-white">{metrics.navigation_error}m</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-[10px] text-[#929DA5] block">nDTW</span>
                    <span className="text-sm font-bold text-[#82B9FF]">{metrics.ndtw}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-[10px] text-[#929DA5] block">SDTW</span>
                    <span className="text-sm font-bold text-[#7EE2A8]">{metrics.sdtw}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================= */}
        {/* BOTTOM PANEL: Navigation Route Progression & Execution Logs */}
        {/* ============================================================= */}
        <div className="h-28 border-t border-white/[0.08] bg-[#0A0D10]/95 px-4 py-2 flex flex-col sm:flex-row gap-4 text-xs">
          {/* Path Timeline Scrubber */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-[10px] text-[#929DA5] font-semibold uppercase tracking-wider mb-1">
              Navigated Path Timeline ({pathTraveled.length} stops)
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {pathTraveled.map((stepNode, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#10161B] border border-white/10 text-[11px] whitespace-nowrap">
                    <span className="text-[9px] font-mono text-[#63E6D1]">#{idx}</span>
                    <span className="font-semibold text-white/90">{stepNode}</span>
                  </div>
                  {idx < pathTraveled.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-white/30 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Execution Logs Stream */}
          <div className="w-full sm:w-96 border-l border-white/[0.08] pl-3 flex flex-col justify-center">
            <span className="text-[10px] text-[#929DA5] font-semibold uppercase tracking-wider mb-0.5">
              Live Engine Logs
            </span>
            <div className="h-16 overflow-y-auto space-y-0.5 text-[10px] font-mono text-white/70">
              {logs.map((lg, i) => (
                <div key={i} className="truncate">{lg}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
