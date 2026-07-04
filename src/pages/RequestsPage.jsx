import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRequests, useUpdateRequestStatus, requestsKeys } from "../hooks/useRequests";
import { useTheme } from "../hooks/useTheme";
import { useSidebarMobile } from "../context/SidebarMobileContext";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { RequestTable } from "../components/dispatcher/RequestTable";
import { RequestDetailDrawer } from "../components/dispatcher/RequestDetailDrawer";
import { RequestFilters } from "../components/dispatcher/RequestFilters";
import { Card } from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Filter, Download, RefreshCw } from "lucide-react";
import { useTranslation } from "../context/LocaleContext";
import { getRequestRegionName } from "../utils/regionName";
import toast from "react-hot-toast";

export default function RequestsPage() {
  const { theme, toggleTheme } = useTheme();
  const { mobileOpen, toggle, close } = useSidebarMobile();
  const { t, locale } = useTranslation();

  const [filters, setFilters] = useState({
    status: "all",
    page: 1,
    pageSize: 20,
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, refetch } = useRequests(filters);
  const updateStatus = useUpdateRequestStatus();
  const queryClient = useQueryClient();

  const requests = useMemo(() => data?.requests || [], [data?.requests]);
  const pagination = {
    currentPage: data?.page || 1,
    totalPages: Math.ceil((data?.total || 0) / (data?.page_size || 20)),
    totalItems: data?.total || 0,
    pageSize: data?.page_size || 20,
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => {
      const merged = { ...prev, ...newFilters, page: 1 };
      for (const key of ["regionId", "from", "to"]) {
        if (!merged[key]) delete merged[key];
      }
      return merged;
    });
    queryClient.invalidateQueries({ queryKey: requestsKeys.lists() });
  }, [queryClient]);

  const handlePageChange = useCallback((newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleUpdateStatus = useCallback(
    async (id, status) => {
      await updateStatus.mutateAsync({ id, status });
    },
    [updateStatus],
  );

  const handleExport = useCallback(() => {
    if (!requests.length) {
      toast.error(t("requests.noMatch"));
      return;
    }

    const headers = [
      t("requests.table.id"),
      t("requests.table.region"),
      t("requests.table.need"),
      t("requests.table.qty"),
      t("requests.table.status"),
      t("requests.table.submitted"),
    ];

    const escCsv = (val) => {
      const str = String(val ?? "");
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const rows = requests.map((r) => [
      r.id,
      getRequestRegionName(r, locale) || t("common.unknown"),
      r.need_type === "bottled_water" ? t("requests.bottledWater") : t("reporter.tankerTruck"),
      r.quantity,
      t(`status.${r.status}`),
      r.created_at ? new Date(r.created_at).toLocaleString() : "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map(escCsv).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wtf-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("requests.exportStarted"));
  }, [t, locale, requests]);

  const handleRefresh = useCallback(async () => {
    await refetch();
    toast.success(t("requests.refreshed"));
  }, [refetch, t]);

  return (
    <div className="min-h-screen bg-neutral-0">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={close} />

      <TopBar
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={toggle}
        onRefresh={handleRefresh}
        refreshing={updateStatus.isPending}
      />

      <main className="pt-14 min-h-screen transition-all duration-200 ms-0 lg:ms-60">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">
                {t("requests.title")}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                {t("requests.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
              >
                {t("common.filters")}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={handleExport}
              >
                {t("common.export")}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={handleRefresh}
                loading={isLoading}
              />
            </div>
          </div>

          <Card className={showFilters ? "mb-6" : "hidden"}>
            <RequestFilters
              filters={filters}
              onChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          </Card>

          <Card>
            <RequestTable
              requests={requests}
              onUpdateStatus={handleUpdateStatus}
              loading={isLoading}
              filter={filters.status}
              onFilterChange={(status) => handleFilterChange({ status })}
              updatingId={
                updateStatus.isPending ? updateStatus.variables?.id : null
              }
              onRowClick={setSelectedRequest}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </Card>
        </div>
      </main>

      <RequestDetailDrawer
        requestId={selectedRequest?.id}
        fallbackRequest={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
}
