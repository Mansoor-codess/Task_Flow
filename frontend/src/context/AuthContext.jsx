import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("team_task_token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("team_task_user");
    return saved ? JSON.parse(saved) : null;
  });

  const persistSession = (payload) => {
    localStorage.setItem("team_task_token", payload.token);
    localStorage.setItem("team_task_user", JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const login = async (values) => {
    const { data } = await api.post("/auth/login", values);
    persistSession(data);
  };

  const signup = async (values) => {
    const { data } = await api.post("/auth/signup", values);
    persistSession(data);
  };

  const logout = () => {
    localStorage.removeItem("team_task_token");
    localStorage.removeItem("team_task_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token && user), login, signup, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
