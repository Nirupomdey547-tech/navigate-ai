"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Layers,
  FlaskConical,
  BarChart3,
  History,
  Cpu,
  BookOpen,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_LINKS = [
  { href: "/navigation", label: "Studio", icon: Compass, badge: "Live" },
  { href: "/environments", label: "Environments", icon: Layers },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/history", label: "History", icon: History },
  { href: "/models", label: "Models", icon: Cpu },
  { href: "/documentation", label: "Docs", icon: BookOpen },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [user, setUser] = useState<{ email: string; username: string } | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("navigate_ai_token") : null;
    if (token) {
      setUser({ email: "researcher@navigate.ai", username: "researcher" });
    }

    fetch(`${API_BASE_URL}/health`)
      .then((res) => {
        if (res.ok) setBackendOnline(true);
      })
      .catch(() => setBackendOnline(false));
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("navigate_ai_token");
    }
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative">
      {/* Top Floating Liquid Glass Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          {/* Logo & Platform Tag */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-7 h-7 rounded-lg liquid-glass-elevated flex items-center justify-center transition-all duration-300 group-hover:border-white/30 group-hover:scale-105">
                <Compass className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold tracking-tight text-sm text-white">
                  NAVIGATE
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-white/20 bg-white/[0.04] text-zinc-300 font-semibold tracking-wider">
                  AI · RXR
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium tracking-tight transition-all duration-200 ${
                      active
                        ? "text-white bg-white/[0.08] border border-white/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 opacity-80" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[8px] font-mono uppercase tracking-widest px-1 py-0.2 rounded bg-white/10 text-white font-bold border border-white/10">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Backend Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Engine Telemetry Pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full liquid-glass-subtle text-[11px]">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendOnline 
                    ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" 
                    : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"
                }`}
              />
              <span className="font-mono text-[10px] tracking-wider text-zinc-400 uppercase">
                {backendOnline ? "ENGINE ONLINE" : "ENGINE OFFLINE"}
              </span>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg liquid-glass-subtle text-xs text-zinc-300">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-mono text-[11px]">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white liquid-glass-interactive transition-all"
                >
                  <LogIn className="w-3 h-3 inline mr-1 opacity-70" />
                  Sign In
                </Link>
                <Link
                  href="/navigation"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  <span>Launch Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pt-3 pb-5 space-y-1.5 bg-black/95 backdrop-blur-2xl border-b border-white/10 animate-fade-in">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-white/10 text-white border border-white/15"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 opacity-70" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
