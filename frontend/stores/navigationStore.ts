// Navigate AI — Zustand store for navigation / simulator state
import { create } from "zustand";
import type { NavigationEpisode, AgentObservation, TrajectoryStep, AgentAction } from "@/types";

interface NavigationState {
  episode: NavigationEpisode | null;
  observation: AgentObservation | null;
  trajectory: TrajectoryStep[];
  lastAction: AgentAction | null;
  isRunning: boolean;
  currentStep: number;
  wsConnected: boolean;

  setEpisode: (episode: NavigationEpisode | null) => void;
  setObservation: (observation: AgentObservation) => void;
  appendTrajectoryStep: (step: TrajectoryStep) => void;
  setLastAction: (action: AgentAction) => void;
  setIsRunning: (isRunning: boolean) => void;
  setWsConnected: (connected: boolean) => void;
  resetNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  episode: null,
  observation: null,
  trajectory: [],
  lastAction: null,
  isRunning: false,
  currentStep: 0,
  wsConnected: false,

  setEpisode: (episode) => set({ episode, trajectory: [], currentStep: 0 }),
  setObservation: (observation) => set({ observation, currentStep: observation.step }),
  appendTrajectoryStep: (step) =>
    set((state) => ({ trajectory: [...state.trajectory, step] })),
  setLastAction: (lastAction) => set({ lastAction }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
  resetNavigation: () =>
    set({
      episode: null,
      observation: null,
      trajectory: [],
      lastAction: null,
      isRunning: false,
      currentStep: 0,
    }),
}));
