import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
  allowedRoles: string[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  const hasAllowedRole = user?.roles?.some((role) => allowedRoles.includes(role))

  if (!hasAllowedRole) {
    // Redirect to appropriate dashboard based on role
    if (user?.roles?.includes('STUDENT')) {
      return <Navigate to="/student/dashboard" replace />
    } else if (user?.roles?.includes('TEACHER')) {
      return <Navigate to="/teacher/dashboard" replace />
    } else if (user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN')) {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
