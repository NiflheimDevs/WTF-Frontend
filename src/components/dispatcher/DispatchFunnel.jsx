import { ArrowDown, AlertTriangle } from "lucide-react";
import { useTranslation } from "../../context/LocaleContext";
import { SegmentedControl } from "../primitives/SegmentedControl";
import { Skeleton } from "../primitives/Skeleton";
import { cn } from "../../utils/cn";
import { formatNumber, toLocaleDigits } from "../../utils/localeDigits";

const STUCK_OPTIONS = [6, 12, 24, 48, 72];

function RateStat({ label, value, intent, locale }) {
  const display =
    value == null
      ? "—"
      : toLocaleDigits(`${(value * 100).toFixed(1)}%`, locale);

  const intentText = {
    success: "text-success-fg",
    danger: "text-danger-fg",
  };

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-widest text-neutral-400">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-xl font-bold tabular-nums leading-none",
          intentText[intent] ?? "text-neutral-900",
        )}
      >
        {display}
      </span>
    </div>
  );
}

export function DispatchFunnel({
  data,
  loading,
  isError,
  threshold,
  onThresholdChange,
  onRetry,
}) {
  const { t, locale } = useTranslation();

  const stages = [
    {
      key: "pending",
      label: t("dashboard.funnelPending"),
      value: data?.pending_count ?? 0,
      bar: "bg-warning-fg",
    },
    {
      key: "dispatched",
      label: t("dashboard.funnelDispatched"),
      value: data?.dispatched_count ?? 0,
      bar: "bg-primary-500",
    },
    {
      key: "fulfilled",
      label: t("dashboard.funnelFulfilled"),
      value: data?.fulfilled_count ?? 0,
      bar: "bg-success-fg",
    },
  ];
  const cancelled = data?.cancelled_count ?? 0;
  const stuck = data?.stuck_dispatched ?? 0;
  const maxCount = Math.max(stages[0].value, stages[1].value, stages[2].value, 1);

  const thresholdOptions = STUCK_OPTIONS.map((h) => ({
    value: String(h),
    label: toLocaleDigits(`${h}h`, locale),
  }));

  return (
    <section className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-neutral-700">
          {t("dashboard.dispatchFunnel")}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400">
            {t("dashboard.stuckThreshold")}
          </span>
          <SegmentedControl
            options={thresholdOptions}
            value={String(threshold)}
            onChange={(v) => onThresholdChange(Number(v))}
            size="xs"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
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
      ) : (
        <>
          <div className="flex flex-col">
            {stages.map((stage, idx) => {
              const next = stages[idx + 1];
              const conversion =
                stage.value > 0 && next
                  ? Math.round((next.value / stage.value) * 100)
                  : null;

              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-neutral-700">
                      {stage.label}
                    </span>
                    <span className="font-mono text-sm font-semibold text-neutral-900">
                      {formatNumber(stage.value, locale)}
                    </span>
                  </div>
                  <div className="h-7 rounded-md bg-neutral-100 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-md transition-all duration-300",
                        stage.bar,
                      )}
                      style={{ width: `${(stage.value / maxCount) * 100}%` }}
                    />
                  </div>

                  {next && (
                    <div className="flex items-center justify-center gap-1 py-1 text-[11px] text-neutral-400">
                      <ArrowDown size={11} />
                      {conversion != null
                        ? t("dashboard.conversionRate", {
                            value: toLocaleDigits(String(conversion), locale),
                          })
                        : "—"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cancelled — separate, off-funnel outcome */}
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-neutral-200">
            <span className="text-xs font-medium text-danger-fg">
              {t("dashboard.funnelCancelled")}
            </span>
            <span className="font-mono text-sm font-semibold text-neutral-900">
              {formatNumber(cancelled, locale)}
            </span>
          </div>

          {/* Stuck dispatched alert */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-md mt-4 px-3 py-2.5",
              stuck > 0 ? "bg-warning-bg" : "bg-neutral-100",
            )}
          >
            <AlertTriangle
              size={16}
              className={stuck > 0 ? "text-warning-fg" : "text-neutral-400"}
            />
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-700">
                {formatNumber(stuck, locale)}{" "}
                <span className="text-neutral-500">
                  {t("dashboard.stuckRequests")}
                </span>
              </p>
              <p className="text-[11px] text-neutral-400">
                {t("dashboard.stuckHint", {
                  hours: toLocaleDigits(String(threshold), locale),
                })}
              </p>
            </div>
          </div>

          {/* Rates footer */}
          <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-neutral-200">
            <RateStat
              label={t("dashboard.fulfillmentRate")}
              value={data?.fulfillment_rate}
              intent="success"
              locale={locale}
            />
            <RateStat
              label={t("dashboard.cancellationRate")}
              value={data?.cancellation_rate}
              intent="danger"
              locale={locale}
            />
          </div>
        </>
      )}
    </section>
  );
}
