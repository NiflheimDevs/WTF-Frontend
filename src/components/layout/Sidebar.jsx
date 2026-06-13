import { NavLink } from "react-router-dom";
import {
  Droplets,
  LayoutDashboard,
  List,
  MapPin,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "../../utils/cn";

export const DISPATCHER_NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    path: "/dispatcher",
  },
  {
    id: "requests",
    label: "Requests",
    icon: List,
    path: "/dispatcher/requests",
  },
  {
    id: "regions",
    label: "Regions",
    icon: MapPin,
    path: "/dispatcher/regions",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/dispatcher/settings",
  },
];

export function Sidebar({ user, onLogout, mobileOpen, onMobileClose }) {
  const navItems = DISPATCHER_NAV_ITEMS;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onMobileClose}
          className="fixed inset-0 bg-neutral-900/40 z-10 lg:hidden border-none cursor-pointer"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-60 bg-neutral-50 border-r border-neutral-200 flex flex-col z-20 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-neutral-200 shrink-0">
        <div className="w-7 h-7 rounded-md bg-primary-500 flex items-center justify-center shrink-0">
          <Droplets size={15} color="white" />
        </div>
        <span className="font-semibold text-sm text-neutral-900">WaterOps</span>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map(({ id, label, icon: Icon, path }) => (
          <NavLink
            key={id}
            to={path}
            end={id === "overview"}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium font-sans border-none cursor-pointer transition-colors duration-100 text-left no-underline
              ${
                isActive
                  ? "bg-primary-50 text-primary-700 border-l-2 border-primary-500"
                  : "bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-neutral-200 pt-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() ||
              user?.email?.charAt(0)?.toUpperCase() ||
              "D"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-neutral-700 truncate">
              {user?.full_name || "Dispatcher"}
            </p>
            <p className="text-[11px] text-neutral-400 truncate">
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="text-neutral-400 hover:text-danger-fg bg-transparent border-none cursor-pointer p-1"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
