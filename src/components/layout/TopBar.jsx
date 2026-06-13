import { Menu, RefreshCw, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DISPATCHER_NAV_ITEMS } from "./Sidebar";
import { cn } from "../../utils/cn";

function useActiveNavLabel() {
  const { pathname } = useLocation();

  const activeItem = DISPATCHER_NAV_ITEMS.find((item) =>
    item.id === "overview"
      ? pathname === item.path
      : pathname.startsWith(item.path),
  );

  return activeItem?.label ?? "Overview";
}

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
  theme,
  onThemeToggle,
  onMenuToggle,
  onRefresh,
  refreshing,
}) {
  const clock = useClock();
  const breadcrumbLabel = useActiveNavLabel();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 lg:left-60 h-14 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between px-4 z-10 transition-all duration-200",
      )}
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
          {breadcrumbLabel}
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
