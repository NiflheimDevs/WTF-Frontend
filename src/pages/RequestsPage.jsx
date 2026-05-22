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
import toast from "react-hot-toast";

export default function RequestsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    page: 1,
    pageSize: 20,
  });
  const [selectedRequestId, setSelectedRequestId] = useState(null);
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
    toast.success("Export started. Download will begin shortly.");
    // Implement export logic
  }, []);

  const handleRefresh = useCallback(async () => {
    await refetch();
    toast.success("Requests refreshed");
  }, [refetch]);

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
        activeNav="requests"
        onNav={() => {}}
        user={user}
        onLogout={logout}
        collapsed={collapsed}
      />

      <TopBar
        activeNav="requests"
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={() => setCollapsed((c) => !c)}
        onRefresh={handleRefresh}
        refreshing={updateStatus.isPending}
        sidebarCollapsed={collapsed}
      />

      <main
        className="pt-14 min-h-screen transition-all duration-200"
        style={{ marginLeft: collapsed ? 64 : 240 }}
      >
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">
                Requests
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage and track water supply requests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={handleExport}
              >
                Export
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

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mb-6">
              <RequestFilters
                filters={filters}
                onChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
              />
            </Card>
          )}

          {/* Requests Table */}
          <Card>
            <RequestTable
              requests={requests}
              onUpdateStatus={handleUpdateStatus}
              loading={isLoading}
              filter={filters.status}
              onFilterChange={(status) => handleFilterChange({ status })}
              updatingId={updateStatus.variables?.id}
              onRowClick={setSelectedRequestId}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </Card>
        </div>
      </main>

      {/* Detail Drawer */}
      <RequestDetailDrawer
        requestId={selectedRequestId}
        isOpen={!!selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
