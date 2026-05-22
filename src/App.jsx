import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Spinner } from "./components/primitives/Spinner";

const ReporterPage = lazy(() => import("./pages/ReporterPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const RequestsPage = lazy(() => import("./pages/RequestsPage"));
const RegionsPage = lazy(() => import("./pages/RegionsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-0">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/dispatcher/login" replace />;
  return children;
}

function Layout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <ReporterPage />
          </Layout>
        }
      />
      <Route
        path="/dispatcher/login"
        element={
          <Layout>
            <LoginPage />
          </Layout>
        }
      />

      <Route
        path="/dispatcher"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dispatcher/requests"
        element={
          <ProtectedRoute>
            <Layout>
              <RequestsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dispatcher/regions"
        element={
          <ProtectedRoute>
            <Layout>
              <RegionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dispatcher/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/404"
        element={
          <Layout>
            <NotFoundPage />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
