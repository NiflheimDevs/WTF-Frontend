import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { authApi } from "../api/endpoints";
import toast from "react-hot-toast";

export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("dispatcher_token");
    const savedUser = localStorage.getItem("dispatcher_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login(email, password);
    const { access_token, expires_at, user: userData } = data;

    setToken(access_token);
    setUser(userData);
    localStorage.setItem("dispatcher_token", access_token);
    localStorage.setItem("dispatcher_user", JSON.stringify(userData));

    return { user: userData, token: access_token, expiresAt: expires_at };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("dispatcher_token");
      localStorage.removeItem("dispatcher_user");
      window.location.href = "/dispatcher/login";
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
    }),
    [user, token, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
