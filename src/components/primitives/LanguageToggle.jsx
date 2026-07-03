import { Globe } from "lucide-react";
import { useTranslation } from "../../context/LocaleContext";
import { cn } from "../../utils/cn";

export function LanguageToggle({ className = "" }) {
  const { locale, toggleLocale, t } = useTranslation();

  return (
    <button
      onClick={toggleLocale}
      className={cn(
        "relative w-9 h-9 rounded-md flex items-center justify-center cursor-pointer",
        "bg-neutral-100 hover:bg-neutral-200 dark:bg-gray-800 dark:hover:bg-gray-700",
        "transition-all duration-300",
        className,
      )}
      aria-label={t("a11y.toggleLanguage")}
      title={locale === "fa" ? "English" : "فارسی"}
    >
      <Globe size={18} className="text-neutral-600 dark:text-neutral-700" />
      <span
        className={cn(
          "absolute -bottom-0.5 -inset-e-0.5 text-[9px] font-bold leading-none",
          "bg-primary-500 text-white rounded px-0.5 py-px min-w-3.5 text-center",
        )}
      >
        {locale === "fa" ? "FA" : "EN"}
      </span>
    </button>
  );
}
