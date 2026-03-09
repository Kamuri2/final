import React, { createContext, useContext, useState, useCallback } from "react";

interface AuthState {
  token: string | null;
  rol: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, rol: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(() => ({
    token: localStorage.getItem("auth_token"),
    rol: localStorage.getItem("auth_rol"),
  }));

  const login = useCallback((token: string, rol: string) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_rol", rol);
    setAuth({ token, rol });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_rol");
    setAuth({ token: null, rol: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, isAuthenticated: !!auth.token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
