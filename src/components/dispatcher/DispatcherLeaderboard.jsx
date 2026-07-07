import { Crown } from "lucide-react";
import { useTranslation } from "../../context/LocaleContext";
import { SegmentedControl } from "../primitives/SegmentedControl";
import { Skeleton } from "../primitives/Skeleton";
import { cn } from "../../utils/cn";
import { formatNumber, toLocaleDigits } from "../../utils/localeDigits";

function initials(name, email) {
  const source = name || email || "?";
  return source.charAt(0).toUpperCase();
}

export function DispatcherLeaderboard({
  data,
  loading,
  isError,
  scope,
  onScopeChange,
  onRetry,
}) {
  const { t, locale } = useTranslation();
  const list = Array.isArray(data) ? data : [];
  const max = Math.max(1, ...list.map((d) => d.dispatch_count || 0));

  const scopeOptions = [
    { value: "", label: t("dashboard.allTime") },
    { value: "today", label: t("dashboard.today") },
  ];

  return (
    <section className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-neutral-700">
          {t("dashboard.dispatcherLeaderboard")}
        </h2>
        <SegmentedControl
          options={scopeOptions}
          value={scope || ""}
          onChange={onScopeChange}
          size="xs"
        />
      </header>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <p className="text-xs text-neutral-400">{t("dashboard.failedToLoad")}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 cursor-pointer bg-transparent border-none"
            >
              {t("dashboard.retry")}
            </button>
          )}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-400">
            {t("dashboard.noDispatcherData")}
          </p>
        </div>
      ) : (
        <ol className="flex flex-col gap-1 list-none p-0 m-0">
          {list.slice(0, 10).map((d, idx) => {
            const isTop = idx === 0;
            return (
              <li
                key={d.user_id}
                className={cn(
                  "flex items-center gap-3 py-1.5 rounded-md px-2 transition-colors duration-100",
                  isTop
                    ? "bg-primary-50 dark:bg-primary-500/20"
                    : "hover:bg-neutral-100",
                )}
              >
                <span className="font-mono text-xs text-neutral-400 w-5 shrink-0 flex items-center gap-0.5">
                  {isTop ? (
                    <Crown size={13} className="text-warning-fg" />
                  ) : (
                    toLocaleDigits(String(idx + 1).padStart(2, "0"), locale)
                  )}
                </span>

                <div className="w-7 h-7 rounded-full bg-primary-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  {initials(d.full_name, d.email)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-700 truncate">
                    {d.full_name || t("auth.dispatcher")}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {d.email}
                  </p>
                </div>

                <div className="w-14 bg-neutral-200 rounded-full h-1.5 overflow-hidden shrink-0">
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      isTop ? "bg-warning-fg" : "bg-primary-500",
                    )}
                    style={{
                      width: `${((d.dispatch_count || 0) / max) * 100}%`,
                    }}
                  />
                </div>

                <span className="font-mono text-xs text-neutral-900 w-8 text-end shrink-0">
                  {formatNumber(d.dispatch_count || 0, locale)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
