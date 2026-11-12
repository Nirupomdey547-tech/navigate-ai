// Navigate AI — Zustand store for experiment state
import { create } from "zustand";
import type { Experiment, EvaluationMetrics } from "@/types";

interface ExperimentState {
  experiments: Experiment[];
  activeExperiment: Experiment | null;
  liveMetrics: EvaluationMetrics | null;
  isLoading: boolean;
  error: string | null;

  setExperiments: (experiments: Experiment[]) => void;
  setActiveExperiment: (experiment: Experiment | null) => void;
  updateLiveMetrics: (metrics: EvaluationMetrics) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  experiments: [],
  activeExperiment: null,
  liveMetrics: null,
  isLoading: false,
  error: null,

  setExperiments: (experiments) => set({ experiments }),
  setActiveExperiment: (activeExperiment) => set({ activeExperiment }),
  updateLiveMetrics: (liveMetrics) => set({ liveMetrics }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
