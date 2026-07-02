import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PageLoader } from "./components/layout/PageLoader";
import { cn } from "./utils/cn";
import { ThemeProvider } from "./context/ThemeContext";

const AppHeader = lazy(() => import("./components/layout/AppHeader"));
const ReporterPage = lazy(() => import("./pages/ReporterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const RequestsPage = lazy(() => import("./pages/RequestsPage"));
const RegionsPage = lazy(() => import("./pages/RegionsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function AppBackground() {
  return (
    <div
      className={cn("fixed inset-0 -z-10 pointer-events-none")}
      style={{
        background:
          "radial-gradient(circle at 0% 0%, rgba(11,107,203,0.08), transparent 50%), var(--color-neutral-0)",
      }}
    />
  );
}

function AppShell({ children }) {
  return (
    <>
      <AppBackground />
      <AppHeader />
      {children}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <AppShell>
                <ReporterPage />
              </AppShell>
            }
          />

          <Route path="/dispatcher" element={<DashboardPage />} />
          <Route path="/dispatcher/requests" element={<RequestsPage />} />
          <Route path="/dispatcher/regions" element={<RegionsPage />} />
          <Route path="/dispatcher/settings" element={<SettingsPage />} />

          <Route
            path="/404"
            element={
              <AppShell>
                <NotFoundPage />
              </AppShell>
            }
          />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}
