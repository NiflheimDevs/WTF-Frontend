import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function DispatcherLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");

  return (
    <div className="min-h-screen bg-neutral-0">
      <Sidebar
        activeNav={activeNav}
        onNav={setActiveNav}
        user={user}
        onLogout={logout}
        collapsed={collapsed}
      />
      <TopBar
        activeNav={activeNav}
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={() => setCollapsed((c) => !c)}
        onRefresh={() => {}}
        refreshing={false}
        sidebarCollapsed={collapsed}
      />

      <main
        className="pt-14 min-h-screen transition-all duration-200"
        style={{ marginLeft: collapsed ? 64 : 240 }}
      >
        <Outlet />
      </main>
    </div>
  );
}
