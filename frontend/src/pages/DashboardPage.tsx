import { Link } from 'react-router-dom'
import { useDashboardMetrics, useOverdueTickets } from '../api/tickets'
import { MetricCard } from '../components/MetricCard'
import { PriorityIndicator } from '../components/PriorityIndicator'

export function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics()
  const { data: overdue, isLoading: overdueLoading } = useOverdueTickets()

  return (
    <div>
      <h1 className="text-xl font-semibold text-text-primary">Dashboard operativo</h1>
      <p className="mt-1 text-sm text-text-muted">Estado general del soporte</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Abiertos" value={metricsLoading ? '—' : (metrics?.byStatus.OPEN ?? 0)} />
        <MetricCard
          label="En progreso"
          value={metricsLoading ? '—' : (metrics?.byStatus.IN_PROGRESS ?? 0)}
        />
        <MetricCard
          label="Vencidos (&gt;48h)"
          value={overdueLoading ? '—' : (overdue?.length ?? 0)}
          accent
        />
        <MetricCard
          label="Resueltos"
          value={metricsLoading ? '—' : (metrics?.byStatus.RESOLVED ?? 0)}
        />
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-surface-border bg-surface-1">
        <div className="border-b border-surface-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text-primary">Tickets vencidos</h2>
        </div>
        {overdueLoading ? (
          <p className="px-4 py-6 text-sm text-text-muted">Cargando…</p>
        ) : overdue && overdue.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-2 font-medium">Ticket</th>
                <th className="px-4 py-2 font-medium">Prioridad</th>
                <th className="px-4 py-2 font-medium">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {overdue.map((ticket) => (
                <tr key={ticket.id} className="border-t border-surface-border hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${ticket.id}`} className="font-medium text-text-primary hover:text-brand-400">
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityIndicator priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Date(ticket.updatedAt).toLocaleString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-4 py-6 text-sm text-text-muted">No hay tickets vencidos.</p>
        )}
      </div>
    </div>
  )
}
