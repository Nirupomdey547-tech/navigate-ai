"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";
import { Compass, Lock, Mail, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerUser(email, username, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D10] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#82B9FF]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-3 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#63E6D1] to-[#82B9FF] p-[1px] shadow-lg shadow-[#63E6D1]/20">
            <div className="w-full h-full bg-[#0A0D10] rounded-[11px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#63E6D1]" />
            </div>
          </div>
          <span className="font-bold tracking-wider text-xl text-white">NAVIGATE AI</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-white">Create Researcher Account</h2>
        <p className="text-xs text-[#929DA5]">Join the Multilingual Vision-and-Language Navigation Platform</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="p-8 rounded-2xl bg-[#10161B]/90 backdrop-blur-xl border border-white/10 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-[#FF7777]/10 border border-[#FF7777]/30 text-xs text-[#FF7777]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#929DA5] block mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alex_research"
                  className="w-full bg-[#0A0D10] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#63E6D1] pl-9"
                />
                <User className="w-4 h-4 text-[#929DA5] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#929DA5] block mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@institute.edu"
                  className="w-full bg-[#0A0D10] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#63E6D1] pl-9"
                />
                <Mail className="w-4 h-4 text-[#929DA5] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#929DA5] block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0A0D10] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#63E6D1] pl-9"
                />
                <Lock className="w-4 h-4 text-[#929DA5] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#63E6D1] to-[#82B9FF] text-[#0A0D10] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#63E6D1]/20 hover:opacity-95 transition-all"
            >
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-[#929DA5] pt-2 border-t border-white/5">
            Already have an account?{" "}
            <Link href="/login" className="text-[#63E6D1] font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
