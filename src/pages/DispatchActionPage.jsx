import { useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useUpdateRequestStatus } from "../hooks/useRequests";
import { useTranslation } from "../context/LocaleContext";

// The PATCH /dispatcher/requests/:id/status endpoint accepts these values.
// "dispatched" is the default for this page (it lives at /dispatch), but the
// same call drives every other transition via ?status=.
const ALLOWED_STATUSES = ["pending", "dispatched", "fulfilled", "cancelled"];

const STATUS_LABEL_KEY = {
  pending: "status.pending",
  dispatched: "status.dispatched",
  fulfilled: "status.fulfilled",
  cancelled: "status.cancelled",
};

export default function DispatchActionPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();

  const id = (params.get("id") || "").trim();
  // Any value outside the allowed set falls back to "dispatched" so a typo in
  // the URL can't push an invalid status to the API.
  const requestedStatus = (params.get("status") || "dispatched").trim();
  const status = ALLOWED_STATUSES.includes(requestedStatus)
    ? requestedStatus
    : "dispatched";

  const updateStatus = useUpdateRequestStatus();

  // Fire the transition exactly once per (id, status). The ref guard keeps
  // React StrictMode's double effect invocation (and re-renders from the
  // mutating hook's identity churn) from issuing duplicate PATCHes.
  const firedFor = useRef("");
  useEffect(() => {
    if (!id) return undefined;
    const key = `${id}:${status}`;
    if (firedFor.current === key) return undefined;
    firedFor.current = key;
    updateStatus.mutate({ id, status });
    return undefined;
  }, [id, status, updateStatus]);

  const isLoading = updateStatus.isPending;
  const isError = updateStatus.isError;
  const isSuccess = updateStatus.isSuccess && !isLoading;
  const statusLabel = t(STATUS_LABEL_KEY[status]);

  return (
    <div className="min-h-screen bg-neutral-0 flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-neutral-50 border border-neutral-200 rounded-lg p-8 flex flex-col items-center text-center gap-3">
        <h1 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
          {t("dispatchAction.title")}
        </h1>

        {!id ? (
          <>
            <AlertTriangle size={28} className="text-neutral-400" />
            <p className="text-base font-semibold text-neutral-900">
              {t("dispatchAction.missingId")}
            </p>
            <p className="text-xs text-neutral-500 font-mono break-all">
              {t("dispatchAction.missingIdHint")}
            </p>
          </>
        ) : isLoading ? (
          <>
            <Loader2 size={28} className="text-neutral-400 animate-spin" />
            <p className="text-base font-semibold text-neutral-900">
              {t("dispatchAction.dispatching")}
            </p>
            <p className="text-xs text-neutral-400 font-mono break-all">{id}</p>
          </>
        ) : isError ? (
          <>
            <AlertTriangle size={28} className="text-danger-fg" />
            <p className="text-base font-semibold text-neutral-900">
              {t("dispatchAction.errorTitle")}
            </p>
            <p className="text-xs text-neutral-400 font-mono break-all">{id}</p>
            <button
              type="button"
              onClick={() => updateStatus.mutate({ id, status })}
              className="mt-1 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-transparent border-none cursor-pointer"
            >
              {t("dispatchAction.retry")}
            </button>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 size={28} className="text-success-fg" />
            <p className="text-base font-semibold text-neutral-900">
              {t("dispatchAction.successTitle")}
            </p>
            <p className="text-sm text-neutral-500">
              {t("dispatchAction.successBody", { status: statusLabel })}
            </p>
          </>
        ) : null}

        <Link
          to="/dispatcher/requests"
          className="mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          {t("dispatchAction.backToRequests")}
        </Link>
      </section>
    </div>
  );
}
