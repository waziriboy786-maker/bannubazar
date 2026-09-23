// Single typed API client — every component fetches through here, never
// with raw fetch() calls scattered around. Keeps auth headers, base URL,
// and error handling consistent in one place.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export interface ApiSuccess<T> { success: true; data: T; meta?: { page: number; limit: number; total?: number; totalPages?: number } }
export interface ApiFailure { success: false; error: { code: string; message: string } }

export class ApiRequestError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("bannu_access_token", token);
    else localStorage.removeItem("bannu_access_token");
  }
}
export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("bannu_access_token");
  }
  return accessToken;
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // send the refresh-token cookie
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const json = (await res.json()) as ApiSuccess<T> | ApiFailure;

  if (!json.success) {
    // Access token expired — try one silent refresh, then retry once.
    if (json.error.code === "UNAUTHORIZED" && retry) {
      const refreshed = await tryRefresh();
      if (refreshed) return request<T>(path, options, false);
    }
    throw new ApiRequestError(json.error.code, json.error.message);
  }

  return json.data;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, { method: "POST", credentials: "include" });
    const json = await res.json();
    if (json.success) {
      setAccessToken(json.data.accessToken);
      return true;
    }
  } catch {
    // ignore
  }
  setAccessToken(null);
  return false;
}

export const api = {
  get: <T,>(path: string) => request<T>(path, { method: "GET" }),
  post: <T,>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T,>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T,>(path: string) => request<T>(path, { method: "DELETE" }),
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const token = getAccessToken();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/uploads/image`, {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    const json = await res.json();
    if (!json.success) throw new ApiRequestError(json.error.code, json.error.message);
    return json.data;
  },
};
