import { Link, useNavigate, useLocation } from "react-router-dom";
import { Droplets, Menu, X, LayoutDashboard, ClipboardList } from "lucide-react";
import { ThemeToggle } from "../primitives/ThemeToggle";
import { LanguageToggle } from "../primitives/LanguageToggle";
import { TrackRequestButton } from "../primitives/TrackRequestButton";
import { Button } from "../primitives/Button";
import { useAuth } from "../../hooks/useAuth";
import { useRouteType } from "../../hooks/useRouteType";
import { useTranslation } from "../../context/LocaleContext";
import { useSidebarMobile } from "../../context/SidebarMobileContext";
import { cn } from "../../utils/cn";
import { useState, useEffect } from "react";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const { isDispatcherRoute } = useRouteType();
  const sidebarMobile = useSidebarMobile();
  const closeSidebar = sidebarMobile?.close;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
    closeSidebar?.();
  }, [location.pathname, closeSidebar]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMobileMenuToggle = () => {
    if (isDispatcherRoute) {
      sidebarMobile?.toggle();
      return;
    }
    setMobileMenuOpen((open) => !open);
  };

  const isMenuOpen = isDispatcherRoute
    ? sidebarMobile?.mobileOpen
    : mobileMenuOpen;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-s-0 inset-e-0 z-50 transition-all duration-300",
          scrolled || isDispatcherRoute
            ? "bg-neutral-0/95 backdrop-blur-sm border-b border-neutral-200 shadow-sm"
            : "bg-neutral-0 border-b border-neutral-200/50",
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                <Droplets size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-neutral-900 tracking-tight">
                  <span>{t("brand.water")}</span>
                  <span className="text-primary-500">{t("brand.supply")}</span>
                </span>
                <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 -mt-0.5">
                  {isDispatcherRoute
                    ? t("brand.dispatchConsole")
                    : t("brand.crisisResponse")}
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />

              {isDispatcherRoute ? (
                user && (
                  <>
                    <div className="h-6 w-px bg-neutral-200" />
                    <div className="flex items-center gap-2">
                      <div className="text-end">
                        <p className="text-xs font-semibold text-neutral-700">
                          {user.full_name || user.email?.split("@")[0]}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          {t(user.role)}
                        </p>
                      </div>
                      <Button
                        className="hover:text-red-300 cursor-pointer"
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                      >
                        {t("auth.logout")}
                      </Button>
                    </div>
                  </>
                )
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ClipboardList}
                    onClick={() => navigate("/track")}
                  >
                    {t("reporter.trackRequest")}
                  </Button>
                  {user && (
                    <div className="flex items-center gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={LayoutDashboard}
                        onClick={() => navigate("/dispatcher")}
                      >
                        {t("auth.goToDashboard")}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleLogout}>
                        {t("auth.logout")}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              {!isDispatcherRoute && <TrackRequestButton />}
              <LanguageToggle />
              <ThemeToggle />
              {(isDispatcherRoute || user) && (
                <button
                  onClick={handleMobileMenuToggle}
                  className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {!isDispatcherRoute && (
        <div
          className={cn(
            "fixed top-16 inset-s-0 inset-e-0 z-40 lg:hidden transition-all duration-300",
            "bg-neutral-0 border-b border-neutral-200",
            mobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none",
          )}
        >
          <div className="px-4 py-4 space-y-2">
            {user && (
              <>
                <button
                  onClick={() => {
                    navigate("/dispatcher");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-start px-3 py-2 text-primary-600 dark:text-primary-400 font-semibold hover:bg-primary-50 dark:hover:bg-primary-950 rounded-md cursor-pointer"
                >
                  {t("auth.goToDashboard")}
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-start px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-md cursor-pointer"
                >
                  {t("auth.logout")}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="h-16" />
    </>
  );
}
