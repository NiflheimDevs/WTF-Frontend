import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useSidebarMobile } from "../../context/SidebarMobileContext";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function DispatcherLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { mobileOpen, toggle, close } = useSidebarMobile();

  return (
    <div className="min-h-screen bg-neutral-0">
      <Sidebar
        user={user}
        onLogout={logout}
        mobileOpen={mobileOpen}
        onMobileClose={close}
      />
      <TopBar
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={toggle}
        onRefresh={() => {}}
        refreshing={false}
      />

      <main className="pt-14 min-h-screen transition-all duration-200 ml-0 lg:ml-60">
        <Outlet />
      </main>
    </div>
  );
}
