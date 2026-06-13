import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "./components/auth/RequireAuth";
import { Spinner } from "./components/primitives/Spinner";
import { cn } from "./utils/cn";
const AppHeader = lazy(() => import("./components/layout/AppHeader"));
const ReporterPage = lazy(() => import("./pages/ReporterPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const RequestsPage = lazy(() => import("./pages/RequestsPage"));
const RegionsPage = lazy(() => import("./pages/RegionsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function Layout({ children }) {
  return <Suspense fallback={<Spinner size="lg" />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <div
              className={cn("fixed inset-0 -z-10 pointer-events-none")}
              style={{
                background:
                  "radial-gradient(circle at 0% 0%, rgba(11,107,203,0.08), transparent 50%), var(--color-neutral-0)",
              }}
            />
            <AppHeader />
            <ReporterPage />
          </Layout>
        }
      />
      <Route
        path="/dispatcher/login"
        element={
          <Layout>
            <div
              className={cn("fixed inset-0 -z-10 pointer-events-none")}
              style={{
                background:
                  "radial-gradient(circle at 0% 0%, rgba(11,107,203,0.08), transparent 50%), var(--color-neutral-0)",
              }}
            />
            <AppHeader />
            <LoginPage />
          </Layout>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dispatcher"
        element={
          <RequireAuth>
            <Layout>
              <div
                className={cn("fixed inset-0 -z-10 pointer-events-none")}
                style={{
                  background:
                    "radial-gradient(circle at 0% 0%, rgba(11,107,203,0.08), transparent 50%), var(--color-neutral-0)",
                }}
              />
              <AppHeader />
              <DashboardPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/dispatcher/requests"
        element={
          <RequireAuth>
            <Layout>
              <div
                className={cn("fixed inset-0 -z-10 pointer-events-none")}
                style={{
                  background:
                    "radial-gradient(circle at 0% 0%, rgba(11,107,203,0.08), transparent 50%), var(--color-neutral-0)",
                }}
              />
              <AppHeader />
              <RequestsPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/dispatcher/regions"
        element={
          <RequireAuth>
            <Layout>
              <div
                className={cn("fixed inset-0 -z-10 pointer-events-none")}
                style={{
                  background:
                    "radial-gradient(circle at 0% 0%, rgba(11,107,203,0.08), transparent 50%), var(--color-neutral-0)",
                }}
              />
              <AppHeader />
              <RegionsPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/dispatcher/settings"
        element={
          <RequireAuth>
            <Layout>
              <div
                className={cn("fixed inset-0 -z-10 pointer-events-none")}
                style={{
                  background:
                    "radial-gradient(circle at 0% 0%, rgba(11,107,203,0.08), transparent 50%), var(--color-neutral-0)",
                }}
              />
              <AppHeader />
              <SettingsPage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/404"
        element={
          <Layout>
            <div
              className={cn("fixed inset-0 -z-10 pointer-events-none")}
              style={{
                background:
                  "radial-gradient(circle at 0% 0%, rgba(11,107,203,0.08), transparent 50%), var(--color-neutral-0)",
              }}
            />
            <AppHeader />
            <NotFoundPage />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
