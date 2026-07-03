import { cn } from "../../utils/cn";
import { useTranslation } from "../../context/LocaleContext";
import { REQUEST_STATUS } from "../../api/types";
import { Check, Clock, Truck, CheckCircle, XCircle } from "lucide-react";

const STEPS = [
  { key: "received", icon: Clock },
  { key: "dispatched", icon: Truck, status: REQUEST_STATUS.DISPATCHED },
  { key: "fulfilled", icon: CheckCircle, status: REQUEST_STATUS.FULFILLED },
];

function getStepState(stepIndex, status) {
  if (status === REQUEST_STATUS.CANCELLED) {
    return stepIndex === 0 ? "complete" : "inactive";
  }

  const progress =
    {
      [REQUEST_STATUS.PENDING]: 1,
      [REQUEST_STATUS.DISPATCHED]: 2,
      [REQUEST_STATUS.FULFILLED]: 3,
    }[status] ?? 1;

  if (stepIndex < progress) return "complete";
  if (stepIndex === progress && progress < STEPS.length) return "active";
  if (progress >= STEPS.length) return "complete";
  return "inactive";
}

export function RequestStatusTimeline({ status }) {
  const { t } = useTranslation();
  const isCancelled = status === REQUEST_STATUS.CANCELLED;

  return (
    <div className="w-full">
      {isCancelled && (
        <div className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-lg bg-danger-bg text-danger-fg text-sm font-medium">
          <XCircle size={16} />
          {t("track.cancelledHint")}
        </div>
      )}

      <ol className="relative flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between">
        {STEPS.map((step, index) => {
          const state = getStepState(index, status);
          const Icon = step.icon;
          const isLast = index === STEPS.length - 1;

          return (
            <li
              key={step.key}
              className={cn(
                "relative flex sm:flex-col sm:items-center sm:text-center gap-3 sm:gap-2 flex-1 pb-6 sm:pb-0",
                !isLast &&
                  "before:absolute before:inset-s-[15px] before:top-8 before:h-[calc(100%-2rem)] before:w-0.5 sm:before:inset-s-auto sm:before:top-[15px] sm:before:h-0.5 sm:before:w-full  sm:before:translate-y-0 sm:before:translate-x-0",
                !isLast && state === "complete" && "before:bg-success-fg/60",
                !isLast && state !== "complete" && "before:bg-neutral-200",
              )}
            >
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  state === "complete" &&
                    "border-success-fg bg-success-bg text-success-fg",
                  state === "active" &&
                    "border-primary-500 bg-primary-50 text-primary-600",
                  state === "inactive" &&
                    "border-neutral-200 bg-neutral-0 text-neutral-400",
                  isCancelled &&
                    index > 0 &&
                    "border-neutral-200 bg-neutral-50 text-neutral-300",
                )}
              >
                {state === "complete" ? (
                  <Check size={14} />
                ) : (
                  <Icon size={14} />
                )}
              </div>

              <div className="min-w-0 pt-0.5 sm:pt-0">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    state === "inactive" || (isCancelled && index > 0)
                      ? "text-neutral-400"
                      : "text-neutral-800",
                  )}
                >
                  {t(`track.steps.${step.key}`)}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5 hidden sm:block">
                  {t(`track.steps.${step.key}Hint`)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
