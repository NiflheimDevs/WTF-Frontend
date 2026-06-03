import { Menu, RefreshCw, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TopBar({
  activeNav,
  theme,
  onThemeToggle,
  onMenuToggle,
  onRefresh,
  refreshing,
  sidebarCollapsed,
}) {
  const clock = useClock();
  const breadcrumb = {
    overview: "Overview",
    requests: "Requests",
    regions: "Regions",
    settings: "Settings",
  };

  return (
    <header
      className={`fixed top-0 right-0 h-14 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between px-4 z-10 transition-all duration-200`}
      style={{ left: sidebarCollapsed ? 64 : 240 }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="text-neutral-400 hover:text-neutral-700 bg-transparent border-none cursor-pointer p-1 lg:hidden"
        >
          <Menu size={18} />
        </button>
        <span className="text-sm text-neutral-400">Dispatch</span>
        <span className="text-neutral-300">›</span>
        <span className="text-sm font-semibold text-neutral-700 capitalize">
          {breadcrumb[activeNav]}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-success-fg animate-pulse-dot" />
          Live
        </div>
        <span className="font-mono text-sm text-neutral-500 hidden sm:block">
          {clock}
        </span>
        <button
          onClick={onRefresh}
          className="text-neutral-400 hover:text-neutral-700 bg-transparent border-none cursor-pointer p-1"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
        <button
          onClick={onThemeToggle}
          className="text-neutral-400 hover:text-neutral-700 bg-transparent border-none cursor-pointer p-1"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
