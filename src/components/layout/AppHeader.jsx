import { Link } from "react-router-dom";
import { Droplets } from "lucide-react";
import { ThemeToggle } from "../primitives/ThemeToggle";
import { LanguageToggle } from "../primitives/LanguageToggle";
import { useTranslation } from "../../context/LocaleContext";
import { cn } from "../../utils/cn";
import { useState, useEffect } from "react";

export default function AppHeader() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-s-0 inset-e-0 z-50 transition-all duration-300",
          scrolled
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
                <span className="text-[10px] font-medium text-neutral-400 -mt-0.5">
                  {t("brand.crisisResponse")}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="h-16" />
    </>
  );
}
