// Navigate AI — WebSocket client hook
import { useEffect, useRef, useCallback } from "react";
import { useNavigationStore } from "@/stores/navigationStore";
import type { WSMessage, AgentObservation, EvaluationMetrics, TrajectoryStep } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

export function useNavigationWS(episodeId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const { setObservation, appendTrajectoryStep, setWsConnected, setIsRunning } =
    useNavigationStore();

  const connect = useCallback(() => {
    if (!episodeId) return;
    const ws = new WebSocket(`${WS_URL}/ws/navigation/${episodeId}`);
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    ws.onmessage = (event) => {
      const msg: WSMessage = JSON.parse(event.data);
      switch (msg.type) {
        case "observation":
          setObservation(msg.payload as AgentObservation);
          break;
        case "action":
          appendTrajectoryStep(msg.payload as TrajectoryStep);
          break;
        case "episode_complete":
          setIsRunning(false);
          break;
      }
    };
  }, [episodeId, setObservation, appendTrajectoryStep, setWsConnected, setIsRunning]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}
