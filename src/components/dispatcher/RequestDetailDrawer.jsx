import { useEffect, useState } from "react";
import { X, Calendar, MapPin, Phone, Clock, Droplet, Truck, Hash } from "lucide-react";
import { useRequestDetail } from "../../hooks/useRequests";
import { useUpdateRequestStatus } from "../../hooks/useRequests";
import { StatusBadge } from "./StatusBadge";
import { Button } from "../primitives/Button";
import { Skeleton } from "../primitives/Skeleton";
import { formatPhone, formatDateTime } from "../../utils/formatters";
import { useTranslation } from "../../context/LocaleContext";
import { getRequestRegionName } from "../../utils/regionName";
import { formatNumber } from "../../utils/localeDigits";
import { AuditLogEntry } from "./AuditLogEntry";

export function RequestDetailDrawer({
  requestId,
  fallbackRequest = null,
  isOpen,
  onClose,
}) {
  const { t, locale } = useTranslation();
  const { data, isLoading } = useRequestDetail(requestId, fallbackRequest);
  const updateStatus = useUpdateRequestStatus();
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const drawerKey = `${requestId ?? ""}-${isOpen}`;
  const [prevDrawerKey, setPrevDrawerKey] = useState(drawerKey);
  if (prevDrawerKey !== drawerKey) {
    setPrevDrawerKey(drawerKey);
    setConfirmingCancel(false);
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const request = data?.request ?? fallbackRequest;
  const auditLog = data?.audit_log || [];
  const showLoading = isLoading && !request;

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus.mutateAsync({ id: requestId, status: newStatus });
    } finally {
      setConfirmingCancel(false);
    }
  };

  const canCancel =
    request?.status === "pending" || request?.status === "dispatched";

  const formatDate = (date) => formatDateTime(date, locale);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      <div className="fixed top-0 inset-e-0 h-full w-full overflow-y-auto max-w-lg bg-neutral-50 shadow-overlay z-50 animate-slide-in-end">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {t("requests.detailTitle")}
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1 ltr-isolate">
              {String(requestId ?? "")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X size={20} className="text-neutral-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {showLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : request ? (
            <>
              <div className="flex items-center justify-between p-4 bg-neutral-0 rounded-lg border border-neutral-200">
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider">
                    {t("requests.currentStatus")}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={request.status} size="lg" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {confirmingCancel ? (
                    <>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleStatusChange("cancelled")}
                        loading={updateStatus.isPending}
                      >
                        {t("requests.confirmCancel")}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setConfirmingCancel(false)}
                        disabled={updateStatus.isPending}
                      >
                        {t("common.cancel")}
                      </Button>
                    </>
                  ) : (
                    <>
                      {request.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange("dispatched")}
                          loading={updateStatus.isPending}
                        >
                          {t("requests.markAsDispatched")}
                        </Button>
                      )}
                      {request.status === "dispatched" && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleStatusChange("fulfilled")}
                          loading={updateStatus.isPending}
                        >
                          {t("requests.markAsFulfilled")}
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setConfirmingCancel(true)}
                          disabled={updateStatus.isPending}
                        >
                          {t("requests.cancelRequest")}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-700">
                  {t("requests.requestInfo")}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-neutral-0 rounded-lg border border-neutral-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MapPin size={14} className="text-primary-500" />
                      <span className="text-[11px] text-neutral-400 uppercase tracking-wider">
                        {t("requests.regionLabel").replace(":", "")}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-900 font-semibold">
                      {getRequestRegionName(request, locale) ||
                        t("common.unknown")}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-0 rounded-lg border border-neutral-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      {request.need_type === "bottled_water" ? (
                        <Droplet size={14} className="text-cyan-500" />
                      ) : (
                        <Truck size={14} className="text-orange-500" />
                      )}
                      <span className="text-[11px] text-neutral-400 uppercase tracking-wider">
                        {t("requests.needTypeLabel").replace(":", "")}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-900 font-semibold">
                      {request.need_type === "bottled_water"
                        ? t("requests.bottledWater")
                        : t("reporter.tankerTruck")}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-0 rounded-lg border border-neutral-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Hash size={14} className="text-neutral-400" />
                      <span className="text-[11px] text-neutral-400 uppercase tracking-wider">
                        {t("requests.quantityLabel").replace(":", "")}
                      </span>
                    </div>
                    <p className="text-lg text-neutral-900 font-bold font-mono ltr-isolate">
                      {formatNumber(request.quantity, locale)}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-0 rounded-lg border border-neutral-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Calendar size={14} className="text-neutral-400" />
                      <span className="text-[11px] text-neutral-400 uppercase tracking-wider">
                        {t("requests.createdLabel").replace(":", "")}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-900 font-medium">
                      {formatDate(request.created_at)}
                    </p>
                  </div>
                  {request.dispatched_at && (
                    <div className="col-span-2 p-3 bg-info-bg/50 rounded-lg border border-info-bg">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Clock size={14} className="text-info-fg" />
                        <span className="text-[11px] text-neutral-400 uppercase tracking-wider">
                          {t("requests.dispatchedLabel").replace(":", "")}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-900 font-medium">
                        {formatDate(request.dispatched_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {request.contact_phone && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-700">
                    {t("requests.contactInfo")}
                  </h3>
                  <div className="flex items-center gap-3 text-sm p-3 bg-neutral-0 rounded-lg border border-neutral-200">
                    <Phone size={16} className="text-neutral-400" />
                    <span className="text-neutral-900 font-mono ltr-isolate">
                      {formatPhone(request.contact_phone, locale)}
                    </span>
                  </div>
                </div>
              )}

              {request.note && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-700">
                    {t("requests.additionalNotes")}
                  </h3>
                  <div className="p-3 bg-neutral-0 rounded-lg border border-neutral-200">
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                      {request.note}
                    </p>
                  </div>
                </div>
              )}

              {auditLog.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-700">
                    {t("requests.activityLog")}
                  </h3>
                  <div>
                    {auditLog.map((log, index) => (
                      <AuditLogEntry
                        key={log.id || index}
                        log={log}
                        isLast={index === auditLog.length - 1}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500">{t("requests.notFound")}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
