"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface LiquidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "subtle" | "default" | "elevated" | "interactive";
  specular?: boolean;
}

export default function LiquidCard({
  children,
  className,
  variant = "default",
  specular = true,
  ...props
}: LiquidCardProps) {
  const variantClasses = {
    subtle: "liquid-glass-subtle",
    default: "liquid-glass",
    elevated: "liquid-glass-elevated",
    interactive: "liquid-glass-interactive cursor-pointer",
  };

  return (
    <div
      className={twMerge(
        clsx(
          "rounded-2xl relative overflow-hidden transition-all duration-300",
          variantClasses[variant],
          className
        )
      )}
      {...props}
    >
      {specular && (
        <div 
          className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" 
        />
      )}
      {children}
    </div>
  );
}
