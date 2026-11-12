'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Globe, Code2, Eye, Brain,
  MousePointerClick, RefreshCw, Database,
} from 'lucide-react';

const STEPS = [
  { id: 0, label: 'Natural Language Input', icon: MessageSquare, color: '#63E6D1' },
  { id: 1, label: 'Language Detection', icon: Globe, color: '#82B9FF' },
  { id: 2, label: 'Instruction Parser', icon: Code2, color: '#63E6D1' },
  { id: 3, label: 'Visual Encoder', icon: Eye, color: '#82B9FF' },
  { id: 4, label: 'Decision Policy', icon: Brain, color: '#63E6D1' },
  { id: 5, label: 'Action Selection', icon: MousePointerClick, color: '#82B9FF' },
  { id: 6, label: 'Environment Update', icon: RefreshCw, color: '#63E6D1' },
  { id: 7, label: 'State Update', icon: Database, color: '#82B9FF' },
];

const STEP_DURATION = 900; // ms per step

export default function PipelineAnimation() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-x-auto pb-2">
      {/* Desktop: horizontal flow */}
      <div className="hidden lg:flex items-center gap-0 min-w-max mx-auto justify-center">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = activeStep === i;
          const isPast = activeStep > i;
          return (
            <div key={step.id} className="flex items-center">
              <motion.div
                animate={{
                  boxShadow: isActive
                    ? `0 0 24px ${step.color}80, 0 0 8px ${step.color}40`
                    : 'none',
                  borderColor: isActive
                    ? step.color
                    : isPast
                    ? `${step.color}60`
                    : 'rgba(255,255,255,0.08)',
                  backgroundColor: isActive
                    ? `${step.color}18`
                    : isPast
                    ? `${step.color}08`
                    : 'rgba(255,255,255,0.03)',
                }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col items-center gap-2 px-4 py-4 rounded-xl border w-[108px] cursor-default select-none"
              >
                <motion.div
                  animate={{
                    color: isActive ? step.color : isPast ? `${step.color}99` : '#ffffff40',
                    scale: isActive ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </motion.div>
                <motion.span
                  animate={{
                    color: isActive ? '#F4F7F8' : isPast ? '#F4F7F880' : '#F4F7F840',
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-[10px] font-medium text-center leading-tight"
                >
                  {step.label}
                </motion.span>

                {/* Active pulse ring */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0.6, 0], scale: [1, 1.5] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="absolute inset-0 rounded-xl border"
                      style={{ borderColor: step.color }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Arrow connector */}
              {i < STEPS.length - 1 && (
                <div className="relative flex items-center w-6 shrink-0">
                  <motion.div
                    animate={{
                      backgroundColor: activeStep > i ? '#63E6D160' : '#ffffff15',
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-px w-full"
                  />
                  <motion.div
                    animate={{
                      borderLeftColor: activeStep > i ? '#63E6D160' : '#ffffff15',
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-0 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px]"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical flow */}
      <div className="flex lg:hidden flex-col gap-2 max-w-xs mx-auto">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = activeStep === i;
          const isPast = activeStep > i;
          return (
            <div key={step.id} className="flex flex-col items-center">
              <motion.div
                animate={{
                  boxShadow: isActive ? `0 0 20px ${step.color}60` : 'none',
                  borderColor: isActive ? step.color : isPast ? `${step.color}50` : 'rgba(255,255,255,0.08)',
                  backgroundColor: isActive ? `${step.color}15` : 'rgba(255,255,255,0.03)',
                }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border"
              >
                <motion.div
                  animate={{ color: isActive ? step.color : isPast ? `${step.color}80` : '#ffffff30' }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                </motion.div>
                <motion.span
                  animate={{ color: isActive ? '#F4F7F8' : isPast ? '#F4F7F870' : '#F4F7F840' }}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-medium"
                >
                  {step.label}
                </motion.span>
              </motion.div>
              {i < STEPS.length - 1 && (
                <motion.div
                  animate={{ backgroundColor: activeStep > i ? '#63E6D150' : '#ffffff10' }}
                  transition={{ duration: 0.3 }}
                  className="w-px h-3"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
