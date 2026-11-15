import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiFetch } from "./api";
import type { RoleType } from "./utils/business-rules";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: RoleType;
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const res = await apiFetch<{ user: SessionUser }>("/api/auth/me");
    if (res.ok) {
      setUser(res.data.user);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ user: SessionUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    if (!res.ok) {
      return { ok: false as const, error: res.error };
    }
    setUser(res.data.user);
    return { ok: true as const };
  }, []);

  const logout = React.useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function ProtectedRoute({
  roles,
  children,
}: {
  roles?: RoleType[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page text-sm text-muted">
        Memuat sesi...
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?callbackUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/?forbidden=1" replace />;
  }

  return <>{children}</>;
}
