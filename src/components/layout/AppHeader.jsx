// src/components/layout/AppHeader.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Droplets,
  Menu,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import { ThemeToggle } from "../primitives/ThemeToggle";
import { Button } from "../primitives/Button";
import { useAuth } from "../../hooks/useAuth";
import { useRouteType } from "../../hooks/useRouteType";
import { cn } from "../../utils/cn";
import { useState, useEffect } from "react";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const { isDispatcherRoute } = useRouteType();
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
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled || isDispatcherRoute
            ? "bg-neutral-0/95 dark:bg-neutral-0/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 shadow-sm"
            : "bg-neutral-0 dark:bg-neutral-0 border-b border-neutral-200/50 dark:border-neutral-800/50",
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to={isDispatcherRoute ? "/dispatcher" : "/"}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                <Droplets size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-neutral-900 tracking-tight">
                  <span>Water</span>
                  <span className="text-primary-500">Supply</span>
                </span>
                <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 -mt-0.5">
                  {isDispatcherRoute ? "Dispatch Console" : "Crisis Response"}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />

              {isDispatcherRoute ? (
                <>
                  <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />
                  <Link
                    to="/dispatcher"
                    className={cn(
                      "text-sm font-medium transition-colors",
                      location.pathname === "/dispatcher"
                        ? "text-primary-500"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200",
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dispatcher/requests"
                    className={cn(
                      "text-sm font-medium transition-colors",
                      location.pathname === "/dispatcher/requests"
                        ? "text-primary-500"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200",
                    )}
                  >
                    Requests
                  </Link>
                  <Link
                    to="/"
                    className={cn(
                      "text-sm font-medium transition-colors",
                      location.pathname === "/"
                        ? "text-primary-500"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200",
                    )}
                  >
                    Reports
                  </Link>
                  {user && (
                    <>
                      <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                            {user.full_name || user.email?.split("@")[0]}
                          </p>
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                            Dispatcher
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLogout}
                        >
                          Logout
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {user ? (
                    <div className="flex items-center gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={LayoutDashboard}
                        onClick={() => navigate("/dispatcher")}
                      >
                        Go to Dashboard
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleLogout}>
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={LogIn}
                        onClick={() => navigate("/dispatcher/login")}
                      >
                        Login
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={UserPlus}
                        onClick={() => navigate("/dispatcher/login?tab=signup")}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed top-16 left-0 right-0 z-40 md:hidden transition-all duration-300",
          "bg-neutral-0 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800",
          mobileMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="px-4 py-4 space-y-2">
          {isDispatcherRoute ? (
            // منوی موبایل دیسپچر
            <>
              <Link
                to="/dispatcher"
                className="block px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/dispatcher/requests"
                className="block px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Requests
              </Link>
              <Link
                to="/"
                className="block px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reports
              </Link>
              {user && (
                <>
                  <div className="my-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {user.full_name || user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            // منوی موبایل عمومی
            <>
              {user ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/dispatcher");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-primary-600 dark:text-primary-400 font-semibold hover:bg-primary-50 dark:hover:bg-primary-950 rounded-md"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate("/dispatcher/login");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate("/dispatcher/login?tab=signup");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-primary-600 dark:text-primary-400 font-semibold hover:bg-primary-50 dark:hover:bg-primary-950 rounded-md"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="h-16" />
    </>
  );
}
