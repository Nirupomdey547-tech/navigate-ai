"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LiquidCard from "@/components/ui/LiquidCard";
import { loginUser } from "@/lib/api";
import { Compass, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginUser(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail("researcher@navigate.ai");
    setPassword("Researcher123!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-3 text-center">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl liquid-glass-elevated flex items-center justify-center transition-all group-hover:scale-105">
            <Compass className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <span className="font-display font-bold tracking-tight text-lg text-white">NAVIGATE AI</span>
        </Link>
        <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
          Sign In to Research Lab
        </h2>
        <p className="text-xs text-zinc-400 font-light">Access multimodal vision-and-language decision models</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <LiquidCard variant="elevated" className="p-8 space-y-6">
          
          {/* 1-Click Auto Fill Demo Credentials Button */}
          <button
            type="button"
            onClick={fillDemoAccount}
            className="w-full py-2.5 px-3 rounded-xl liquid-glass-interactive text-xs font-medium text-white flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 opacity-80" />
            <span>Auto-fill Demo Researcher Account</span>
          </button>

          {error && (
            <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@navigate.ai"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 pl-9"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 pl-9 pr-9 font-mono"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 disabled:opacity-40 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-white/[0.08]">
            <span className="text-xs text-zinc-500 font-light">
              Need an account?{" "}
              <Link href="/register" className="text-white hover:underline font-medium">
                Create researcher account
              </Link>
            </span>
          </div>

        </LiquidCard>
      </div>

    </div>
  );
}
