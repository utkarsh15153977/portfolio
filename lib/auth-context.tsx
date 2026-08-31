"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch, apiPublic } from "@/lib/api";

const TOKEN_KEY = "utkarsh-jwt";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
}

interface RegisterResult {
  id: number;
  email: string;
  name: string;
}

interface AuthContextValue extends AuthState {
  register: (email: string, name: string, password: string) => Promise<RegisterResult>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* private mode */
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  // Validate token on mount
  useEffect(() => {
    const token = readToken();
    if (!token) {
      setState({ user: null, token: null, loading: false });
      return;
    }

    apiFetch<{ id: number; email: string; name: string }>("/api/users/me")
      .then((data) => {
        setState({ user: { id: data.id, email: data.email, name: data.name }, token, loading: false });
      })
      .catch(() => {
        clearToken();
        setState({ user: null, token: null, loading: false });
      });
  }, []);

  const register = useCallback(async (email: string, name: string, password: string): Promise<RegisterResult> => {
    const result = await apiPublic<RegisterResult>("/api/auth/register", {
      method: "POST",
      json: { email, name, password },
    });
    return result;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiPublic<{ token: string; id: number; email: string; name: string }>(
      "/api/auth/login",
      { method: "POST", json: { email, password } }
    );
    storeToken(result.token);
    setState({
      user: { id: result.id, email: result.email, name: result.name },
      token: result.token,
      loading: false,
    });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setState({ user: null, token: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
