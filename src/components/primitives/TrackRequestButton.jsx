import { ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/LocaleContext";
import { cn } from "../../utils/cn";

export function TrackRequestButton({ className = "" }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <button
      onClick={() => navigate("/track")}
      className={cn(
        "relative w-9 h-9 rounded-md flex items-center justify-center cursor-pointer",
        "bg-neutral-100 hover:bg-neutral-200 dark:bg-gray-800 dark:hover:bg-gray-700",
        "transition-all duration-300",
        className,
      )}
      aria-label={t("a11y.trackRequest")}
      title={t("reporter.trackRequest")}
    >
      <ClipboardList
        size={18}
        className="text-neutral-600 dark:text-neutral-700"
      />
    </button>
  );
}
