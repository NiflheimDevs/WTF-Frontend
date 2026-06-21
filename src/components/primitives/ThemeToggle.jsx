// src/components/primitives/ThemeToggle.jsx
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../context/LocaleContext";
import { cn } from "../../utils/cn";

export function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-9 h-9 rounded-md flex items-center justify-center",
        "bg-neutral-100 hover:bg-neutral-200 dark:bg-gray-800 dark:hover:bg-gray-700",
        "transition-all duration-300",
        className,
      )}
      aria-label={t("a11y.toggleTheme")}
    >
      {/* Sun icon - shows in dark mode (because clicking it goes to light) */}
      <Sun
        size={18}
        className={cn(
          "absolute transition-all duration-300 rotate-0 scale-100 text-neutral-600 dark:text-neutral-900",
          theme === "dark"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-0",
        )}
      />
      {/* Moon icon - shows in light mode */}
      <Moon
        size={18}
        className={cn(
          "absolute transition-all duration-300",
          theme === "light"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-0",
        )}
      />
    </button>
  );
}
