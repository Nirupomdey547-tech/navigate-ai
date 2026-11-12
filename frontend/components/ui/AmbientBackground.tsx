"use client";

import React, { useEffect, useState } from "react";

export default function AmbientBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Deep Obsidian Radial Ambient Lights */}
      <div 
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] rounded-full blur-[140px] opacity-25"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, rgba(161,161,170,0.04) 50%, transparent 75%)"
        }}
      />
      
      <div 
        className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-15"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 70%)"
        }}
      />

      {/* Subtle Micro-Grid Matrix for Architectural Precision */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/80" />
    </div>
  );
}
