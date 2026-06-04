import { useEffect } from "react";
import { X, Calendar, MapPin, Phone, Clock } from "lucide-react";
import { useRequestDetail } from "../../hooks/useRequests";
import { useUpdateRequestStatus } from "../../hooks/useRequests";
import { StatusBadge } from "./StatusBadge";
import { Button } from "../primitives/Button";
import { Skeleton } from "../primitives/Skeleton";
import { formatPhone } from "../../utils/formatters";

export function RequestDetailDrawer({
  requestId,
  isOpen,
  onClose,
  onUpdateStatus,
}) {
  const { data, isLoading } = useRequestDetail(requestId);
  const updateStatus = useUpdateRequestStatus();

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

  const request = data?.request;
  const auditLog = data?.audit_log || [];

  const handleStatusChange = async (newStatus) => {
    await updateStatus.mutateAsync({ id: requestId, status: newStatus });
    onUpdateStatus?.(requestId, newStatus);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-neutral-50 shadow-overlay z-50 animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Request Details
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              {requestId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <X size={20} className="text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : request ? (
            <>
              {/* Status Section */}
              <div className="flex items-center justify-between p-4 bg-neutral-0 rounded-lg border border-neutral-200">
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider">
                    Current Status
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={request.status} size="lg" />
                  </div>
                </div>
                {request.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange("dispatched")}
                    loading={updateStatus.isPending}
                  >
                    Mark as Dispatched
                  </Button>
                )}
                {request.status === "dispatched" && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleStatusChange("fulfilled")}
                    loading={updateStatus.isPending}
                  >
                    Mark as Fulfilled
                  </Button>
                )}
              </div>

              {/* Request Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-700">
                  Request Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="text-neutral-400" />
                    <span className="text-neutral-700">Region: </span>
                    <span className="text-neutral-900 font-medium">
                      {request.region_name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-neutral-400" />
                    <span className="text-neutral-700">Created: </span>
                    <span className="text-neutral-900">
                      {new Date(request.created_at).toLocaleString()}
                    </span>
                  </div>
                  {request.dispatched_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock size={16} className="text-neutral-400" />
                      <span className="text-neutral-700">Dispatched: </span>
                      <span className="text-neutral-900">
                        {new Date(request.dispatched_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-4" />
                    <span className="text-neutral-700">Need Type: </span>
                    <span className="text-neutral-900 font-medium capitalize">
                      {request.need_type === "bottled_water"
                        ? "Bottled Water"
                        : "Tanker Truck"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-4" />
                    <span className="text-neutral-700">Quantity: </span>
                    <span className="text-neutral-900 font-mono font-semibold">
                      {request.quantity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              {request.contact_phone && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-700">
                    Contact Information
                  </h3>
                  <div className="flex items-center gap-3 text-sm p-3 bg-neutral-0 rounded-lg border border-neutral-200">
                    <Phone size={16} className="text-neutral-400" />
                    <span className="text-neutral-900">
                      {formatPhone(request.contact_phone)}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {request.note && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-700">
                    Additional Notes
                  </h3>
                  <div className="p-3 bg-neutral-0 rounded-lg border border-neutral-200">
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                      {request.note}
                    </p>
                  </div>
                </div>
              )}

              {/* Audit Log */}
              {auditLog.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-700">
                    Activity Log
                  </h3>
                  <div className="space-y-2">
                    {auditLog.map((log, index) => (
                      <div
                        key={log.id || index}
                        className="flex gap-3 text-sm p-3 bg-neutral-0 rounded-lg border border-neutral-200"
                      >
                        <div className="w-1 h-auto bg-primary-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-xs text-neutral-400">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                          <p className="text-sm text-neutral-700 mt-1 capitalize">
                            {log.event_type?.replace(/_/g, " ")}
                          </p>
                          {log.payload && (
                            <pre className="text-xs text-neutral-500 mt-1 overflow-x-auto">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500">Request not found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
