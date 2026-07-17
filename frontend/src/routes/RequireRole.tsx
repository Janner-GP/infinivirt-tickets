import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, type UserRole } from '../auth/AuthContext'

export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/tickets" replace />
  }

  return <Outlet />
}
