import { useMemo } from "react";
import { Filter, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { RequestRow } from "./RequestRow";
import { Button } from "../primitives/Button";
import { Skeleton } from "../primitives/Skeleton";
import { useTranslation } from "../../context/LocaleContext";
import { useRegions } from "../../hooks/useRegions";
import { cn } from "../../utils/cn";

export function RequestTable({
  requests,
  onUpdateStatus,
  loading,
  filter,
  onFilterChange,
  updatingId,
  onRowClick,
  pagination,
  onPageChange,
}) {
  const { t, locale } = useTranslation();
  const { data: regions = [] } = useRegions();
  const regionsById = useMemo(
    () => new Map(regions.map((region) => [region.id, region])),
    [regions],
  );
  const statuses = ["all", "pending", "dispatched", "fulfilled", "cancelled"];

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter size={14} className="text-neutral-400" />
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-all duration-100",
              filter === status
                ? "bg-primary-500 text-white shadow-sm"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200",
            )}
          >
            {t(`status.${status}`)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {t("requests.table.id")}
              </th>
              <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {t("requests.table.region")}
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {t("requests.table.need")}
              </th>
              <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {t("requests.table.qty")}
              </th>
              <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {t("requests.table.status")}
              </th>
              <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {t("requests.table.submitted")}
              </th>
              <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {t("requests.table.action")}
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <AlertCircle size={24} />
                    <p className="text-sm font-medium">{t("requests.noMatch")}</p>
                    <button
                      onClick={() => onFilterChange("all")}
                      className="text-xs text-primary-500 font-semibold hover:underline"
                    >
                      {t("common.clearFilters")}
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  onUpdateStatus={onUpdateStatus}
                  onRowClick={onRowClick}
                  isUpdating={updatingId === request.id}
                  regionsById={regionsById}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-neutral-400">
            {t("requests.showing", {
              from: (pagination.currentPage - 1) * pagination.pageSize + 1,
              to: Math.min(
                pagination.currentPage * pagination.pageSize,
                pagination.totalItems,
              ),
              total: pagination.totalItems,
            })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              {locale === "fa" ? (
                <ChevronRight size={14} className="me-1" />
              ) : (
                <ChevronLeft size={14} className="me-1" />
              )}
              {t("common.previous")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              {t("common.next")}
              {locale === "fa" ? (
                <ChevronLeft size={14} className="ms-1" />
              ) : (
                <ChevronRight size={14} className="ms-1" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
