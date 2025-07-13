import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  initialized: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1) Hydrate token + axios header
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // seed user from JWT payload
      try {
        const { sub: id, email, role } = JSON.parse(atob(token.split(".")[1]));
        setUser({ id, email, role });
      } catch {
        localStorage.removeItem("token");
      }
    }

    // 2) Catch 401’s → logout + redirect
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          setUser(null);
          localStorage.removeItem("token");
          navigate("/login");
        }
        return Promise.reject(err);
      }
    );

    setInitialized(true);
    return () => api.interceptors.response.eject(id);
  }, [navigate]);

  // don't render children until init complete
  if (!initialized) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, initialized }}>
      {children}
    </AuthContext.Provider>
  );
}
