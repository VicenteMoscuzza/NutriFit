import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login: async ({ identifier, password }) => {
        const res = await api.post("/api/auth/login", { identifier, password });
        setUser(res.data.user);
      },
      logout: async () => {
        await api.post("/api/auth/logout");
        setUser(null);
      },
    }),
    [user, loading]
  );

  // No renderiza nada hasta saber si hay sesión activa
  if (loading) return null;
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}