import {
  Droplets,
  LayoutDashboard,
  List,
  MapPin,
  Settings,
  LogOut,
} from "lucide-react";

export function Sidebar({ activeNav, onNav, user, onLogout, collapsed }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "requests", label: "Requests", icon: List },
    { id: "regions", label: "Regions", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-neutral-50 border-r border-neutral-200 flex flex-col z-20 transition-all duration-200 ${collapsed ? "w-16" : "w-60"}`}
    >
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-neutral-200 shrink-0">
        <div className="w-7 h-7 rounded-md bg-primary-500 flex items-center justify-center shrink-0">
          <Droplets size={15} color="white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm text-neutral-900">
            WaterOps
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNav(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium font-sans border-none cursor-pointer transition-colors duration-100 text-left
              ${
                activeNav === id
                  ? "bg-primary-50 text-primary-700 border-l-2 border-primary-500"
                  : "bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
              }`}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && label}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-neutral-200 pt-3">
        <div
          className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() ||
              user?.email?.charAt(0)?.toUpperCase() ||
              "D"}
          </div>
          {!collapsed && (
            <>
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
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
