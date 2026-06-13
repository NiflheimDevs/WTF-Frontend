import { useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRequests, useUpdateRequestStatus } from "../hooks/useRequests";
import { useTheme } from "../hooks/useTheme";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { RequestTable } from "../components/dispatcher/RequestTable";
import { RequestDetailDrawer } from "../components/dispatcher/RequestDetailDrawer";
import { RequestFilters } from "../components/dispatcher/RequestFilters";
import { Card } from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Filter, Download, RefreshCw } from "lucide-react";
import { useTranslation } from "../context/LocaleContext";
import toast from "react-hot-toast";

export default function RequestsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    page: 1,
    pageSize: 20,
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, refetch } = useRequests(filters);
  const updateStatus = useUpdateRequestStatus();

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleUpdateStatus = useCallback(
    (id, status) => {
      updateStatus.mutate({ id, status });
    },
    [updateStatus],
  );

  const handleExport = useCallback(() => {
    toast.success(t("requests.exportStarted"));
  }, [t]);

  const handleRefresh = useCallback(async () => {
    await refetch();
    toast.success(t("requests.refreshed"));
  }, [refetch, t]);

  const requests = data?.requests || [];
  const pagination = {
    currentPage: data?.page || 1,
    totalPages: Math.ceil((data?.total || 0) / (data?.page_size || 20)),
    totalItems: data?.total || 0,
    pageSize: data?.page_size || 20,
  };

  return (
    <div className="min-h-screen bg-neutral-0">
      <Sidebar
        user={user}
        onLogout={logout}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <TopBar
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={() => setMobileMenuOpen((open) => !open)}
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

          {showFilters && (
            <Card className="mb-6">
              <RequestFilters
                filters={filters}
                onChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
              />
            </Card>
          )}

          <Card>
            <RequestTable
              requests={requests}
              onUpdateStatus={handleUpdateStatus}
              loading={isLoading}
              filter={filters.status}
              onFilterChange={(status) => handleFilterChange({ status })}
              updatingId={updateStatus.variables?.id}
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
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
