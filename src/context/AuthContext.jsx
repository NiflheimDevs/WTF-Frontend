import { createContext, useState, useCallback, useMemo } from "react";
import { authApi } from "../api/endpoints";

export const AuthContext = createContext(null);

function getStoredAuth() {
  try {
    const savedToken = localStorage.getItem("dispatcher_token");
    const savedUser = localStorage.getItem("dispatcher_user");
    if (savedToken && savedUser) {
      return {
        token: savedToken,
        user: JSON.parse(savedUser),
      };
    }
  } catch {
    // Ignore invalid stored auth
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }) {
  const storedAuth = getStoredAuth();
  const [user, setUser] = useState(storedAuth.user);
  const [token, setToken] = useState(storedAuth.token);
  const [loading] = useState(false);

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
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.remove("dark");
      window.location.href = "/login";
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
