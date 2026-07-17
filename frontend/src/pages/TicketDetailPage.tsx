import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { extractErrorMessage } from '../api/client'
import {
  useAddComment,
  useAssignTicket,
  useTicket,
  useUpdateTicketFields,
  useUpdateTicketStatus,
} from '../api/tickets'
import { useUsers } from '../api/users'
import { useAuth } from '../auth/AuthContext'
import { PriorityIndicator } from '../components/PriorityIndicator'
import { StatusBadge } from '../components/StatusBadge'
import { useToast } from '../components/Toast'
import type { TicketPriority, TicketStatus } from '../types/ticket'

const STATUS_OPTIONS: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED']
const PRIORITY_OPTIONS: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { data: ticket, isLoading } = useTicket(ticketId)

  const canChangeStatus = user?.role === 'ADMIN' || user?.role === 'AGENT'
  const canReassign = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR'
  const canChangePriority = user?.role === 'ADMIN'
  const canMarkInternal = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR'

  const { data: users } = useUsers(user?.role === 'ADMIN' || user?.role === 'SUPERVISOR')

  const updateStatus = useUpdateTicketStatus(ticketId ?? '')
  const updateFields = useUpdateTicketFields(ticketId ?? '')
  const assignTicket = useAssignTicket(ticketId ?? '')
  const addComment = useAddComment(ticketId ?? '')

  const [commentText, setCommentText] = useState('')
  const [commentInternal, setCommentInternal] = useState(false)
  const [assigneeId, setAssigneeId] = useState('')

  const agents = useMemo(() => (users ?? []).filter((u) => u.role === 'AGENT'), [users])
  const usersById = useMemo(() => new Map((users ?? []).map((u) => [u.id, u])), [users])

  if (isLoading) return <p className="text-sm text-text-muted">Cargando…</p>
  if (!ticket) return <p className="text-sm text-text-muted">Ticket no encontrado.</p>

  const handleStatusChange = async (status: TicketStatus) => {
    try {
      await updateStatus.mutateAsync(status)
      showToast('Estado actualizado')
    } catch (error) {
      showToast(extractErrorMessage(error, 'No se pudo cambiar el estado'), 'error')
    }
  }

  const handlePriorityChange = async (priority: TicketPriority) => {
    try {
      await updateFields.mutateAsync({ priority })
      showToast('Prioridad actualizada')
    } catch (error) {
      showToast(extractErrorMessage(error, 'No se pudo cambiar la prioridad'), 'error')
    }
  }

  const handleReassign = async () => {
    if (!assigneeId) return
    try {
      await assignTicket.mutateAsync(assigneeId)
      showToast('Ticket reasignado')
      setAssigneeId('')
    } catch (error) {
      showToast(extractErrorMessage(error, 'No se pudo reasignar el ticket'), 'error')
    }
  }

  const handleComment = async () => {
    if (!commentText.trim()) return
    try {
      await addComment.mutateAsync({ content: commentText, isInternal: commentInternal })
      setCommentText('')
      setCommentInternal(false)
    } catch (error) {
      showToast(extractErrorMessage(error, 'No se pudo agregar el comentario'), 'error')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityIndicator priority={ticket.priority} />
          </div>
          <h1 className="text-lg font-semibold text-text-primary">{ticket.title}</h1>
          <p className="mt-1 text-xs text-text-muted">
            Creado {new Date(ticket.createdAt).toLocaleString('es-CO')}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
        <div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {ticket.description}
          </p>

          <div className="mt-6 overflow-hidden rounded-lg border border-surface-border bg-surface-1">
            <div className="border-b border-surface-border px-4 py-3">
              <h2 className="text-sm font-semibold text-text-primary">
                Comentarios ({ticket.comments?.length ?? 0})
              </h2>
            </div>
            <div className="divide-y divide-surface-border">
              {(ticket.comments ?? []).map((comment) => (
                <div
                  key={comment.id}
                  className={`px-4 py-3 ${comment.isInternal ? 'bg-status-pending-bg/30' : ''}`}
                >
                  <div className="mb-1 flex items-center gap-2 text-xs text-text-muted">
                    <span>{new Date(comment.createdAt).toLocaleString('es-CO')}</span>
                    {comment.isInternal && (
                      <span className="rounded bg-status-pending-bg px-1.5 py-0.5 text-[10px] font-medium uppercase text-status-pending">
                        Nota interna
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-primary">{comment.content}</p>
                </div>
              ))}
              {(ticket.comments ?? []).length === 0 && (
                <p className="px-4 py-4 text-sm text-text-muted">Sin comentarios todavía.</p>
              )}
            </div>
            <div className="border-t border-surface-border p-4">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                placeholder="Escribe un comentario"
                className="w-full rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <div className="mt-2 flex items-center justify-between">
                {canMarkInternal ? (
                  <label className="flex items-center gap-2 text-xs text-text-secondary">
                    <input
                      type="checkbox"
                      checked={commentInternal}
                      onChange={(e) => setCommentInternal(e.target.checked)}
                    />
                    Nota interna
                  </label>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={handleComment}
                  className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-surface-border bg-surface-1 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Detalles</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Asignado a</dt>
                <dd className="text-text-primary">
                  {ticket.assignedToId
                    ? (usersById.get(ticket.assignedToId)?.name ?? 'Asignado')
                    : 'Sin asignar'}
                </dd>
              </div>
            </dl>
          </div>

          {(canChangeStatus || canChangePriority || canReassign) && (
            <div className="space-y-3 rounded-lg border border-surface-border bg-surface-1 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Acciones</h3>

              {canChangeStatus && (
                <div>
                  <label className="block text-xs text-text-secondary">Cambiar estado</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className="mt-1 w-full rounded-md border border-surface-border bg-surface-2 px-2 py-1.5 text-sm text-text-primary"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {canChangePriority && (
                <div>
                  <label className="block text-xs text-text-secondary">Cambiar prioridad</label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                    className="mt-1 w-full rounded-md border border-surface-border bg-surface-2 px-2 py-1.5 text-sm text-text-primary"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {canReassign && (
                <div>
                  <label className="block text-xs text-text-secondary">Reasignar a</label>
                  <div className="mt-1 flex gap-2">
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="w-full rounded-md border border-surface-border bg-surface-2 px-2 py-1.5 text-sm text-text-primary"
                    >
                      <option value="">Selecciona…</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleReassign}
                      className="rounded-md border border-surface-border px-2 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-2"
                    >
                      Asignar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
