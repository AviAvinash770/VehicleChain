import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  updateUserWallet: (walletAddress: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("vehiclechain_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("vehiclechain_token");
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get("/auth/me");
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem("vehiclechain_user", JSON.stringify(res.data.user));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem("vehiclechain_token", res.data.token);
      localStorage.setItem("vehiclechain_user", JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.data.message || "Login failed");
  };

  const register = async (data: any): Promise<User> => {
    const res = await api.post("/auth/register", data);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem("vehiclechain_token", res.data.token);
      localStorage.setItem("vehiclechain_user", JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.data.message || "Registration failed");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("vehiclechain_token");
    localStorage.removeItem("vehiclechain_user");
  };

  const updateUserWallet = async (walletAddress: string) => {
    const res = await api.post("/auth/link-wallet", { walletAddress });
    if (res.data.success && user) {
      const updated = { ...user, walletAddress: res.data.walletAddress };
      setUser(updated);
      localStorage.setItem("vehiclechain_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
