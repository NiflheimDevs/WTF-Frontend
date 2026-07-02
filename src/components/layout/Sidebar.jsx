import { NavLink } from "react-router-dom";
import {
  Droplets,
  LayoutDashboard,
  List,
  MapPin,
  Settings,
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

export function Sidebar({ mobileOpen, onMobileClose }) {
  const { t } = useTranslation();
  const navItems = DISPATCHER_NAV_ITEMS;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label={t("nav.closeMenu")}
          onClick={onMobileClose}
          className="fixed inset-0 bg-neutral-900/40 z-10 lg:hidden border-none cursor-pointer"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 rtl:left-auto rtl:right-0 h-full w-60 bg-neutral-50 border-e border-neutral-200 flex flex-col z-20 transition-transform duration-200",
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
      </aside>
    </>
  );
}
