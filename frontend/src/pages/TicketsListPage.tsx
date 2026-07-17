import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../api/categories'
import { useTickets, type TicketFilters } from '../api/tickets'
import { PriorityIndicator } from '../components/PriorityIndicator'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../auth/AuthContext'
import type { TicketPriority, TicketStatus } from '../types/ticket'

const STATUS_OPTIONS: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED']
const PRIORITY_OPTIONS: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En progreso',
  PENDING_CUSTOMER: 'Esperando cliente',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
}

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

const selectClass =
  'h-9 rounded-md border border-surface-border bg-surface-2 px-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

export function TicketsListPage() {
  const { user } = useAuth()
  const [status, setStatus] = useState<TicketStatus | ''>('')
  const [priority, setPriority] = useState<TicketPriority | ''>('')
  const [subcategoryId, setSubcategoryId] = useState('')

  const filters: TicketFilters = {
    status: status || undefined,
    priority: priority || undefined,
    subcategoryId: subcategoryId || undefined,
  }

  const { data: tickets, isLoading } = useTickets(filters)
  const { data: categories } = useCategories()

  const subcategoryOptions = useMemo(
    () =>
      (categories ?? []).flatMap((category) =>
        (category.subcategories ?? []).map((sub) => ({
          id: sub.id,
          label: `${category.name} / ${sub.name}`,
        })),
      ),
    [categories],
  )

  const isStaff = user?.role !== 'CLIENT'
  const canCreate = user?.role === 'ADMIN' || user?.role === 'AGENT' || user?.role === 'CLIENT'

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Tickets</h1>
          <p className="mt-1 text-sm text-text-muted">
            {user?.role === 'AGENT' && 'Mostrando únicamente los tickets asignados a ti.'}
            {user?.role === 'CLIENT' && 'Tus solicitudes de soporte.'}
            {(user?.role === 'ADMIN' || user?.role === 'SUPERVISOR') && 'Todos los tickets del sistema.'}
          </p>
        </div>
        {canCreate && (
          <Link
            to="/tickets/new"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Nuevo ticket
          </Link>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TicketStatus | '')}
          className={selectClass}
        >
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TicketPriority | '')}
          className={selectClass}
        >
          <option value="">Toda prioridad</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        <select
          value={subcategoryId}
          onChange={(e) => setSubcategoryId(e.target.value)}
          className={selectClass}
        >
          <option value="">Toda categoría</option>
          {subcategoryOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-surface-border bg-surface-1">
        {isLoading ? (
          <p className="px-4 py-6 text-sm text-text-muted">Cargando…</p>
        ) : tickets && tickets.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-2 font-medium">Ticket</th>
                <th className="px-4 py-2 font-medium">Prioridad</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                {isStaff && <th className="px-4 py-2 font-medium">Asignado</th>}
                <th className="px-4 py-2 font-medium">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-t border-surface-border hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="font-medium text-text-primary hover:text-brand-400"
                    >
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityIndicator priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ticket.status} />
                  </td>
                  {isStaff && (
                    <td className="px-4 py-3 text-text-muted">{ticket.assignedToId ? 'Asignado' : 'Sin asignar'}</td>
                  )}
                  <td className="px-4 py-3 text-text-muted">
                    {new Date(ticket.updatedAt).toLocaleString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-4 py-6 text-sm text-text-muted">No hay tickets que coincidan con los filtros.</p>
        )}
      </div>
    </div>
  )
}
