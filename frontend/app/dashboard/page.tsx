"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import LiquidCard from "@/components/ui/LiquidCard";
import { getAnalyticsOverview, getHistory, getEnvironments } from "@/lib/api";
import {
  Compass,
  Layers,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Globe2,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>({
    total_runs: 0,
    completed_runs: 0,
    successful_runs: 0,
    success_rate: 0.0,
    average_spl: 0.0,
    average_navigation_error: 0.0,
  });
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [environments, setEnvironments] = useState<any[]>([]);

  useEffect(() => {
    getAnalyticsOverview().then(setOverview).catch(console.error);
    getHistory(6).then(setRecentRuns).catch(console.error);
    getEnvironments().then(setEnvironments).catch(console.error);
  }, []);

  return (
    <AppShell>
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-black text-white">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/[0.08]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-subtle text-[11px] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                RESEARCH DASHBOARD
              </span>
              <span className="text-white/20">/</span>
              <span className="text-white font-medium">RxR Live Analytics</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Multilingual Navigation Telemetry
            </h1>
            <p className="text-sm text-zinc-400 font-light max-w-2xl">
              Persistent tracking of sequential decision policies, topological path efficiency, and cross-lingual generalization across indoor environments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/navigation"
              className="px-6 py-3 rounded-xl font-medium text-xs bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2 group"
            >
              <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
              <span>Launch Studio</span>
            </Link>
          </div>
        </div>

        {/* 4 Monochromatic KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LiquidCard variant="subtle" className="p-6 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
                Total Episodes
              </span>
              <Compass className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-3xl font-display font-bold text-white tracking-tight">
              {overview.total_runs || 0}
            </div>
            <span className="text-[11px] text-zinc-500 font-light block">
              Persistent database records
            </span>
          </LiquidCard>

          <LiquidCard variant="subtle" className="p-6 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
                Success Rate (SR)
              </span>
              <CheckCircle2 className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-3xl font-display font-bold text-white tracking-tight">
              {Math.round((overview.success_rate || 0) * 100)}%
            </div>
            <span className="text-[11px] text-zinc-500 font-light block">
              {overview.successful_runs || 0} / {overview.completed_runs || 0} episodes reached goal
            </span>
          </LiquidCard>

          <LiquidCard variant="subtle" className="p-6 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
                Mean Path Efficiency (SPL)
              </span>
              <Zap className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-3xl font-display font-bold text-white tracking-tight">
              {overview.average_spl ? Number(overview.average_spl).toFixed(3) : "0.000"}
            </div>
            <span className="text-[11px] text-zinc-500 font-light block">
              Success weighted by Path Length
            </span>
          </LiquidCard>

          <LiquidCard variant="subtle" className="p-6 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
                Mean Navigation Error
              </span>
              <Globe2 className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-3xl font-display font-bold text-white tracking-tight">
              {overview.average_navigation_error ? `${overview.average_navigation_error}m` : "0.0m"}
            </div>
            <span className="text-[11px] text-zinc-500 font-light block">
              Terminal distance to goal node
            </span>
          </LiquidCard>
        </div>

        {/* 2-Column Section: Recent Navigation Episodes & Active Environments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Runs Table */}
          <LiquidCard variant="default" className="lg:col-span-2 p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Recent Navigation Episodes
                </h3>
                <p className="text-xs text-zinc-400 font-light">
                  Latest recorded agent trajectories and decision logs
                </p>
              </div>
              <Link 
                href="/history" 
                className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 font-medium group"
              >
                <span>Full history</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {recentRuns.length > 0 ? (
                recentRuns.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl liquid-glass-subtle hover:border-white/20 transition-all flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10px] text-zinc-400">#{r.id}</span>
                        <span className="font-medium text-white">{r.environment_id}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase bg-white/5 border border-white/10 text-zinc-300">
                          {r.language || "en"}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate font-light">{r.instruction}</p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                            r.success === 1
                              ? "border-white/30 text-white bg-white/5"
                              : "border-zinc-700 text-zinc-500 bg-transparent"
                          }`}
                        >
                          {r.success === 1 ? "Goal Reached" : "Halted"}
                        </span>
                        {r.metrics?.spl !== undefined && (
                          <span className="block text-[10px] font-mono text-zinc-400 mt-1">
                            SPL: {r.metrics.spl}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/history`}
                        className="p-2 rounded-lg liquid-glass-interactive text-zinc-400 hover:text-white"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-zinc-500 font-light">
                  No episodes recorded yet. Launch your first navigation experiment.
                </div>
              )}
            </div>
          </LiquidCard>

          {/* Active Environments Overview */}
          <LiquidCard variant="subtle" className="p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">Environments</h3>
                <p className="text-xs text-zinc-400 font-light">{environments.length} Indoor Topologies</p>
              </div>
              <Link href="/environments" className="text-xs text-zinc-400 hover:text-white">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {environments.map((env) => (
                <div
                  key={env.id}
                  className="p-3.5 rounded-xl liquid-glass-interactive flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-medium text-white">{env.name}</h4>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {env.node_count} nodes · {env.edge_count} edges
                    </span>
                  </div>
                  <Link
                    href={`/navigation`}
                    className="px-2.5 py-1 rounded-md bg-white text-black font-semibold text-[10px] hover:bg-zinc-200 transition-colors"
                  >
                    Load
                  </Link>
                </div>
              ))}
            </div>
          </LiquidCard>

        </div>

      </div>
    </AppShell>
  );
}
