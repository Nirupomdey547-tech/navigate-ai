/**
 * Navigate AI — API Client for Backend Communication
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getAuthHeaders(): HeadersInit {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("navigate_ai_token");
    if (token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return {
    "Content-Type": "application/json",
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...getAuthHeaders(), ...options.headers };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errData.detail || `Request failed with status ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

// Environments API
export async function getEnvironments() {
  return request<any[]>("/api/environments");
}

export async function getEnvironment(id: string) {
  return request<any>(`/api/environments/${id}`);
}

export async function getEnvironmentInstructions(envId: string, language?: string) {
  const q = language ? `?language=${language}` : "";
  return request<any[]>(`/api/environments/${envId}/instructions${q}`);
}

export async function createEnvironment(data: any) {
  return request<any>("/api/environments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Navigation API
export async function startNavigation(data: {
  environment_id: string;
  instruction: string;
  language?: string;
  start_node?: string;
  goal_node?: string;
}) {
  return request<any>("/api/navigation/start", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function stepNavigation(runId: string) {
  return request<any>(`/api/navigation/${runId}/step`, {
    method: "POST",
  });
}

export async function pauseNavigation(runId: string) {
  return request<any>(`/api/navigation/${runId}/pause`, {
    method: "POST",
  });
}

export async function resumeNavigation(runId: string) {
  return request<any>(`/api/navigation/${runId}/resume`, {
    method: "POST",
  });
}

export async function stopNavigation(runId: string) {
  return request<any>(`/api/navigation/${runId}/stop`, {
    method: "POST",
  });
}

export async function resetNavigation(runId: string) {
  return request<any>(`/api/navigation/${runId}/reset`, {
    method: "POST",
  });
}

export async function manualIntervention(runId: string, action_type: string, target_node: string) {
  return request<any>(`/api/navigation/${runId}/intervene`, {
    method: "POST",
    body: JSON.stringify({ run_id: parseInt(runId) || 0, action_type, target_node }),
  });
}

// Agent API
export async function parseInstruction(instruction: string, language?: string) {
  return request<any>("/api/agent/parse-instruction", {
    method: "POST",
    body: JSON.stringify({ instruction, language }),
  });
}

export async function getAgentStatus() {
  return request<any>("/api/agent/status");
}

// Experiments API
export async function getExperiments() {
  return request<any[]>("/api/experiments");
}

export async function createExperiment(data: any) {
  return request<any>("/api/experiments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function runExperiment(id: number) {
  return request<any>(`/api/experiments/${id}/run`, {
    method: "POST",
  });
}

// Analytics API
export async function getAnalyticsOverview() {
  return request<any>("/api/analytics/overview");
}

export async function getAnalyticsLanguages() {
  return request<any[]>("/api/analytics/languages");
}

export async function getAnalyticsEnvironments() {
  return request<any[]>("/api/analytics/environments");
}

export async function getAnalyticsMetrics() {
  return request<any[]>("/api/analytics/metrics");
}

// History API
export async function getHistory(limit = 50) {
  return request<any[]>(`/api/history?limit=${limit}`);
}

export async function getRunDetails(runId: number | string) {
  return request<any>(`/api/history/${runId}`);
}

export async function getRunReplay(runId: number | string) {
  return request<any>(`/api/history/${runId}/replay`);
}

// Models API
export async function getModels() {
  return request<any>("/api/models");
}

// Auth API
export async function loginUser(email: string, password: string) {
  const res = await request<{ access_token: string; refresh_token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (typeof window !== "undefined" && res.access_token) {
    localStorage.setItem("navigate_ai_token", res.access_token);
  }
  return res;
}

export async function registerUser(email: string, username: string, password: string) {
  const res = await request<{ access_token: string; refresh_token: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });
  if (typeof window !== "undefined" && res.access_token) {
    localStorage.setItem("navigate_ai_token", res.access_token);
  }
  return res;
}

export async function getCurrentUser() {
  return request<any>("/api/auth/me");
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("navigate_ai_token");
  }
}
