"use client";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export type ApiUser = {
  _id: string;
  email: string;
  fullname: string;
  contact?: string;
  verified?: boolean;
};

export type Project = {
  _id: string;
  name: string;
  currentCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

type AuthPayload = {
  token?: string;
  user: ApiUser;
};

const TOKEN_KEY = "zorviq_token";
const USER_KEY = "zorviq_user";

export const authStore = {
  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string | undefined, user?: ApiUser) {
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser(): ApiUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ApiUser;
    } catch {
      return null;
    }
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

const getErrorMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
  }
  return fallback;
};

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const token = authStore.getToken();
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, `Request failed with ${response.status}`));
  }

  return payload as ApiEnvelope<T>;
}

export async function loginUser(email: string, password: string) {
  const response = await apiFetch<AuthPayload>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  authStore.set(response.data.token, response.data.user);
  return response.data.user;
}

export async function registerUser(payload: {
  fullname: string;
  email: string;
  contact?: string;
  password: string;
}) {
  const response = await apiFetch<{ user: ApiUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data.user;
}

export async function getMe() {
  const response = await apiFetch<{ user: ApiUser }>("/api/auth/get-me");
  authStore.set(undefined, response.data.user);
  return response.data.user;
}

export async function logoutUser() {
  try {
    await apiFetch<unknown>("/api/auth/logout", { method: "POST" });
  } finally {
    authStore.clear();
  }
}

export async function listProjects() {
  const response = await apiFetch<Project[]>("/api/projects");
  return response.data;
}

export async function createProject(name: string, currentCode: string | null = null) {
  const response = await apiFetch<Project>("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name, currentCode }),
  });
  return response.data;
}

export async function updateProject(
  id: string,
  payload: Partial<Pick<Project, "name" | "currentCode">>,
) {
  const response = await apiFetch<Project>(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function deleteProject(id: string) {
  await apiFetch<unknown>(`/api/projects/${id}`, { method: "DELETE" });
}

export async function getProject(id: string) {
  const response = await apiFetch<Project>(`/api/projects/${id}`);
  return response.data;
}

export async function enqueueGeneration(projectId: string, prompt: string) {
  const response = await apiFetch<{
    jobId: string;
    status: "queued" | "done";
    cached: boolean;
    code?: string;
    queuePosition?: number;
    estimatedWaitSeconds?: number;
  }>("/api/generate", {
    method: "POST",
    body: JSON.stringify({ projectId, prompt }),
  });
  return response.data;
}

export async function getGenerationStatus(jobId: string) {
  const response = await apiFetch<{ status: string; output?: string | null }>(
    `/api/generate/status/${jobId}`,
  );
  return response.data;
}
