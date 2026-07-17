import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { CategoriesPage } from '../pages/CategoriesPage'
import { ClientsPage } from '../pages/ClientsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { TicketCreatePage } from '../pages/TicketCreatePage'
import { TicketDetailPage } from '../pages/TicketDetailPage'
import { TicketsListPage } from '../pages/TicketsListPage'
import { UsersPage } from '../pages/UsersPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RequireRole } from './RequireRole'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route element={<RequireRole roles={['ADMIN', 'SUPERVISOR']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route path="/tickets" element={<TicketsListPage />} />
          <Route element={<RequireRole roles={['ADMIN', 'AGENT', 'CLIENT']} />}>
            <Route path="/tickets/new" element={<TicketCreatePage />} />
          </Route>
          <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />

          <Route element={<RequireRole roles={['ADMIN', 'SUPERVISOR']} />}>
            <Route path="/clients" element={<ClientsPage />} />
          </Route>

          <Route element={<RequireRole roles={['ADMIN']} />}>
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  )
}
