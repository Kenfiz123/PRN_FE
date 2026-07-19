import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import { PERMISSIONS } from './auth/permissions'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ClubsPage from './pages/ClubsPage'
import ReportsPage from './pages/ReportsPage'
import ActivitiesPage from './pages/ActivitiesPage'
import FinancePage from './pages/FinancePage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import UsersPage from './pages/UsersPage'

// Protected Route Component
function ProtectedRoute({ children, permission }) {
  const { isAuthenticated, loading, hasPermission } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="text-center">
          <div className="cyber-spinner mx-auto mb-4" />
          <p className="font-orbitron text-cyan-400 animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Route with Layout
function LayoutRoute({ children, title, subtitle, permission }) {
  return (
    <ProtectedRoute permission={permission}>
      <Layout title={title} subtitle={subtitle}>
        {children}
      </Layout>
    </ProtectedRoute>
  )
}

// Auth Route (redirect if already logged in)
function AuthRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="cyber-spinner mx-auto" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <RegisterPage />
          </AuthRoute>
        }
      />

      {/* Protected Routes with Layout */}
      <Route
        path="/dashboard"
        element={
          <LayoutRoute title="Dashboard" subtitle="Overview" permission={PERMISSIONS.VIEW_DASHBOARD}>
            <DashboardPage />
          </LayoutRoute>
        }
      />
      <Route
        path="/clubs"
        element={
          <LayoutRoute title="Clubs" subtitle="Management" permission={PERMISSIONS.VIEW_CLUBS}>
            <ClubsPage />
          </LayoutRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <LayoutRoute title="Reports" subtitle="Management" permission={PERMISSIONS.VIEW_REPORTS}>
            <ReportsPage />
          </LayoutRoute>
        }
      />
      <Route
        path="/activities"
        element={
          <LayoutRoute title="Activities" subtitle="Management" permission={PERMISSIONS.VIEW_ACTIVITIES}>
            <ActivitiesPage />
          </LayoutRoute>
        }
      />
      <Route
        path="/finance"
        element={
          <LayoutRoute title="Finance" subtitle="Management" permission={PERMISSIONS.VIEW_FINANCE}>
            <FinancePage />
          </LayoutRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <LayoutRoute title="Notifications" subtitle="Alerts" permission={PERMISSIONS.VIEW_NOTIFICATIONS}>
            <NotificationsPage />
          </LayoutRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <LayoutRoute title="Profile" subtitle="Settings" permission={PERMISSIONS.VIEW_PROFILE}>
            <ProfilePage />
          </LayoutRoute>
        }
      />
      <Route
        path="/users"
        element={
          <LayoutRoute title="Users" subtitle="System Administration" permission={PERMISSIONS.MANAGE_USERS}>
            <UsersPage />
          </LayoutRoute>
        }
      />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
