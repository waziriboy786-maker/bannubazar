"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, setAccessToken, getAccessToken, ApiRequestError } from "./api";

export interface CurrentUser {
  id: string;
  role: "CUSTOMER" | "SELLER" | "DELIVERY_PARTNER" | "ADMIN" | "SUPER_ADMIN";
  name: string;
  email: string | null;
  phone: string | null;
}

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: { name: string; email?: string; phone?: string; password: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchUser = async () => {
    if (!getAccessToken()) { setUser(null); setLoading(false); return; }
    try {
      const me = await api.get<CurrentUser>("/auth/me");
      setUser(me);
    } catch (e) {
      if (e instanceof ApiRequestError) setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refetchUser(); }, []);

  const login = async (identifier: string, password: string) => {
    const { accessToken } = await api.post<{ accessToken: string }>("/auth/login", { identifier, password });
    setAccessToken(accessToken);
    await refetchUser();
  };

  const register = async (data: { name: string; email?: string; phone?: string; password: string; role: string }) => {
    const { accessToken } = await api.post<{ accessToken: string }>("/auth/register", data);
    setAccessToken(accessToken);
    await refetchUser();
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
