import { NavLink } from "react-router-dom";
import {
  Droplets,
  LayoutDashboard,
  List,
  MapPin,
  Settings,
  LogOut,
} from "lucide-react";
import { useTranslation } from "../../context/LocaleContext";
import { cn } from "../../utils/cn";

export const DISPATCHER_NAV_ITEMS = [
  {
    id: "overview",
    icon: LayoutDashboard,
    path: "/dispatcher",
  },
  {
    id: "requests",
    icon: List,
    path: "/dispatcher/requests",
  },
  {
    id: "regions",
    icon: MapPin,
    path: "/dispatcher/regions",
  },
  {
    id: "settings",
    icon: Settings,
    path: "/dispatcher/settings",
  },
];

export function Sidebar({ user, onLogout, mobileOpen, onMobileClose }) {
  const { t } = useTranslation();
  const navItems = DISPATCHER_NAV_ITEMS;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label={t("nav.closeMenu")}
          onClick={onMobileClose}
          className="fixed inset-0 bg-neutral-900/40 z-30 lg:hidden border-none cursor-pointer"
        />
      )}

      <aside
        className={cn(
          "fixed top-16 left-0 rtl:left-auto rtl:right-0 h-[calc(100%-4rem)] w-60 bg-neutral-50 border-e border-neutral-200 flex flex-col z-40 lg:top-0 lg:h-full lg:z-20 transition-transform duration-200",
          !mobileOpen &&
            "max-lg:-translate-x-full max-lg:rtl:translate-x-full",
          mobileOpen && "max-lg:translate-x-0",
        )}
      >
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-neutral-200 shrink-0">
          <div className="w-7 h-7 rounded-md bg-primary-500 flex items-center justify-center shrink-0">
            <Droplets size={15} color="white" />
          </div>
          <span className="font-semibold text-sm text-neutral-900">
            {t("brand.waterOps")}
          </span>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {navItems.map(({ id, icon: Icon, path }) => (
            <NavLink
              key={id}
              to={path}
              end={id === "overview"}
              onClick={onMobileClose}
              className={({ isActive }) =>
                cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium font-sans border-none cursor-pointer transition-colors duration-100 text-start no-underline",
                  isActive
                    ? "bg-primary-50 text-primary-700 border-s-2 border-primary-500"
                    : "bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700",
                )
              }
            >
              <Icon size={18} className="shrink-0" />
              {t(`nav.${id}`)}
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
                {user?.full_name || t("auth.dispatcher")}
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
