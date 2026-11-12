"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { getAnalyticsOverview, getHistory, getEnvironments } from "@/lib/api";
import {
  Compass,
  Layers,
  FlaskConical,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Globe2,
  Sparkles,
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
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#63E6D1]/10 text-[#63E6D1] border border-[#63E6D1]/20">
                RESEARCH DASHBOARD
              </span>
              <span className="text-xs text-[#929DA5]">Google Research RxR Benchmark</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Multilingual Vision-and-Language Agent
            </h1>
            <p className="text-sm text-[#929DA5] mt-1 max-w-2xl">
              Real-time monitoring of instruction understanding, environmental state-space planning, and multimodal navigation decisions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/navigation"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#63E6D1] to-[#82B9FF] text-[#0A0D10] shadow-lg shadow-[#63E6D1]/20 hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Navigation Studio</span>
            </Link>
          </div>
        </div>

        {/* 4 Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group hover:border-[#63E6D1]/40 transition-colors">
            <div className="flex items-center justify-between text-[#929DA5] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Navigation Runs</span>
              <Compass className="w-4 h-4 text-[#63E6D1]" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">
              {overview.total_runs || 0}
            </div>
            <span className="text-[11px] text-[#7EE2A8] flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Stored persistently in database
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group hover:border-[#7EE2A8]/40 transition-colors">
            <div className="flex items-center justify-between text-[#929DA5] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Success Rate (SR)</span>
              <CheckCircle2 className="w-4 h-4 text-[#7EE2A8]" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-[#7EE2A8]">
              {Math.round((overview.success_rate || 0) * 100)}%
            </div>
            <span className="text-[11px] text-[#929DA5] mt-1 block">
              {overview.successful_runs || 0} successful / {overview.completed_runs || 0} completed
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group hover:border-[#82B9FF]/40 transition-colors">
            <div className="flex items-center justify-between text-[#929DA5] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Average SPL</span>
              <Zap className="w-4 h-4 text-[#82B9FF]" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-[#82B9FF]">
              {overview.average_spl ? Number(overview.average_spl).toFixed(3) : "0.000"}
            </div>
            <span className="text-[11px] text-[#929DA5] mt-1 block">
              Success weighted by Path Length
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group hover:border-[#F5C66B]/40 transition-colors">
            <div className="flex items-center justify-between text-[#929DA5] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Navigation Error</span>
              <Globe2 className="w-4 h-4 text-[#F5C66B]" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">
              {overview.average_navigation_error ? `${overview.average_navigation_error}m` : "0.0m"}
            </div>
            <span className="text-[11px] text-[#929DA5] mt-1 block">
              Distance to goal at termination
            </span>
          </div>
        </div>

        {/* 2-Column Section: Recent Navigation Episodes & Active Environments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Runs Table */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Navigation Episodes</h3>
                <p className="text-xs text-[#929DA5]">Latest evaluation runs from database</p>
              </div>
              <Link href="/history" className="text-xs text-[#63E6D1] hover:underline flex items-center gap-1">
                <span>View all history</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {recentRuns.length > 0 ? (
                recentRuns.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#63E6D1] font-bold">#{r.id}</span>
                        <span className="font-semibold text-white/90">{r.environment_id}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase bg-white/10 text-white/80">
                          {r.language || "en"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#929DA5] truncate">{r.instruction}</p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            r.success === 1
                              ? "bg-[#7EE2A8]/20 text-[#7EE2A8]"
                              : "bg-[#FF7777]/20 text-[#FF7777]"
                          }`}
                        >
                          {r.success === 1 ? "Success" : "Failed"}
                        </span>
                        {r.metrics?.spl !== undefined && (
                          <span className="block text-[10px] font-mono text-[#82B9FF] mt-0.5">
                            SPL: {r.metrics.spl}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/history`}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#929DA5] hover:text-white"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[#929DA5]">
                  No runs recorded yet. Launch your first navigation experiment!
                </div>
              )}
            </div>
          </div>

          {/* Active Environments Overview */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Environments</h3>
                <p className="text-xs text-[#929DA5]">{environments.length} Indoor Graph Topologies</p>
              </div>
              <Link href="/environments" className="text-xs text-[#63E6D1] hover:underline">
                Explore
              </Link>
            </div>

            <div className="space-y-2.5">
              {environments.map((env) => (
                <div
                  key={env.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-white">{env.name}</h4>
                    <span className="text-[10px] text-[#929DA5] font-mono">
                      {env.node_count} nodes • {env.edge_count} edges
                    </span>
                  </div>
                  <Link
                    href={`/navigation`}
                    className="px-2.5 py-1 rounded bg-[#63E6D1]/10 text-[#63E6D1] text-[10px] font-bold hover:bg-[#63E6D1]/20 transition-colors"
                  >
                    Load Map
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
