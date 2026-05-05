import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ReporterPage    from './pages/ReporterPage'
import LoginPage       from './pages/LoginPage'
import DashboardPage   from './pages/DashboardPage'

// Protects /dispatcher routes — redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '2px solid var(--border)',
          borderTopColor: 'var(--color-primary-500)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    )
  }

  if (!user) return <Navigate to="/dispatcher/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public reporter page */}
      <Route path="/" element={<ReporterPage />} />

      {/* Dispatcher login */}
      <Route path="/dispatcher/login" element={<LoginPage />} />

      {/* Protected dispatcher dashboard */}
      <Route
        path="/dispatcher"
        element={
          // <ProtectedRoute> //teseting rn when fr we have to remove
            <DashboardPage />
          // </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}