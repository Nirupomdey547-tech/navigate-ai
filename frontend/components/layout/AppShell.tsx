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
  Settings,
  LogIn,
  LogOut,
  User,
  Activity,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_LINKS = [
  { href: "/navigation", label: "Navigation Studio", icon: Compass, badge: "Live" },
  { href: "/environments", label: "Environments", icon: Layers },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/history", label: "Run History", icon: History },
  { href: "/models", label: "AI Models", icon: Cpu },
  { href: "/documentation", label: "Docs", icon: BookOpen },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [user, setUser] = useState<{ email: string; username: string } | null>(null);

  useEffect(() => {
    // Check user in localStorage or check auth
    const token = typeof window !== "undefined" ? localStorage.getItem("navigate_ai_token") : null;
    if (token) {
      setUser({ email: "researcher@navigate.ai", username: "researcher" });
    }

    // Ping health
    fetch("http://127.0.0.1:8000/health")
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
    <div className="min-h-screen flex flex-col bg-[#0A0D10] text-[#F4F7F8]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0A0D10]/80 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Platform Tag */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#63E6D1] to-[#82B9FF] p-[1px] shadow-lg shadow-[#63E6D1]/20">
                <div className="w-full h-full bg-[#0A0D10] rounded-[11px] flex items-center justify-center group-hover:bg-[#10161B] transition-colors">
                  <Compass className="w-5 h-5 text-[#63E6D1] group-hover:rotate-45 transition-transform duration-500" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-wider text-sm bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                    NAVIGATE
                  </span>
                  <span className="text-xs px-1.5 py-0.2 rounded font-mono font-semibold bg-[#63E6D1]/10 text-[#63E6D1] border border-[#63E6D1]/20">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-[#929DA5] tracking-tight">
                  RxR Decision Agent
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? "bg-white/[0.08] text-[#63E6D1] border border-[#63E6D1]/30 shadow-sm shadow-[#63E6D1]/10"
                        : "text-[#929DA5] hover:text-[#F4F7F8] hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[9px] px-1 py-0.2 rounded-full font-bold bg-[#63E6D1]/20 text-[#63E6D1]">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Backend Status & User Profile */}
          <div className="flex items-center gap-3">
            {/* Backend connection pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-[#929DA5]">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  backendOnline ? "bg-[#7EE2A8] shadow-[0_0_8px_#7EE2A8]" : "bg-[#FF7777]"
                }`}
              />
              <span className="font-mono text-[10px]">
                {backendOnline ? "ENGINE ONLINE" : "OFFLINE"}
              </span>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                  <User className="w-3.5 h-3.5 text-[#63E6D1]" />
                  <span className="text-xs text-white/90 font-medium">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 rounded-lg hover:bg-white/[0.08] text-[#929DA5] hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/navigation"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#63E6D1] to-[#82B9FF] text-[#0A0D10] hover:opacity-95 shadow-md shadow-[#63E6D1]/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Studio</span>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] text-[#929DA5]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-[#10161B] border-b border-white/[0.08]">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    active
                      ? "bg-white/[0.08] text-[#63E6D1]"
                      : "text-[#929DA5] hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
