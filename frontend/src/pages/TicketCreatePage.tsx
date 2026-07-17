import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useCategories } from '../api/categories'
import { useClients } from '../api/clients'
import { extractErrorMessage } from '../api/client'
import { useCreateTicket } from '../api/tickets'
import { useUsers } from '../api/users'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../components/Toast'

const ticketSchema = z.object({
  clientId: z.string().optional(),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  subcategoryId: z.string().min(1, 'Selecciona una subcategoría'),
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assignedToId: z.string().optional(),
})

type TicketFormValues = z.infer<typeof ticketSchema>

const inputClass =
  'mt-1 w-full rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'
const labelClass = 'block text-sm font-medium text-text-secondary'

export function TicketCreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const isClient = user?.role === 'CLIENT'
  const isAdmin = user?.role === 'ADMIN'

  const { data: clients } = useClients(!isClient)
  const { data: categories } = useCategories()
  const { data: users } = useUsers(isAdmin)
  const createTicket = useCreateTicket()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { priority: 'MEDIUM' },
  })

  const selectedCategoryId = watch('categoryId')

  const subcategories = useMemo(
    () => categories?.find((c) => c.id === selectedCategoryId)?.subcategories ?? [],
    [categories, selectedCategoryId],
  )
  const agents = useMemo(() => (users ?? []).filter((u) => u.role === 'AGENT'), [users])

  const onSubmit = async (values: TicketFormValues) => {
    setServerError(null)
    try {
      const ticket = await createTicket.mutateAsync({
        clientId: isClient ? undefined : values.clientId,
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId,
        title: values.title,
        description: values.description,
        priority: values.priority,
        assignedToId: isAdmin && values.assignedToId ? values.assignedToId : undefined,
      })
      showToast('Ticket creado correctamente')
      navigate(`/tickets/${ticket.id}`)
    } catch (error) {
      setServerError(extractErrorMessage(error, 'No se pudo crear el ticket. Intenta de nuevo.'))
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-text-primary">Nuevo ticket</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-8">
        <section className="space-y-4 rounded-lg border border-surface-border bg-surface-1 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Identificación
          </h2>
          {!isClient && (
            <div>
              <label className={labelClass} htmlFor="clientId">
                Cliente
              </label>
              <select id="clientId" className={inputClass} {...register('clientId')}>
                <option value="">Selecciona un cliente…</option>
                {(clients ?? []).map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className={labelClass} htmlFor="priority">
              Prioridad
            </label>
            <select id="priority" className={inputClass} {...register('priority')}>
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
            </select>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-surface-border bg-surface-1 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Clasificación
          </h2>
          <div>
            <label className={labelClass} htmlFor="categoryId">
              Categoría
            </label>
            <select id="categoryId" className={inputClass} {...register('categoryId')}>
              <option value="">Selecciona una categoría…</option>
              {(categories ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-priority-critical">{errors.categoryId.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass} htmlFor="subcategoryId">
              Subcategoría
            </label>
            <select
              id="subcategoryId"
              className={inputClass}
              disabled={!selectedCategoryId}
              {...register('subcategoryId')}
            >
              <option value="">Selecciona una subcategoría…</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
            {errors.subcategoryId && (
              <p className="mt-1 text-sm text-priority-critical">{errors.subcategoryId.message}</p>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-surface-border bg-surface-1 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Detalle</h2>
          <div>
            <label className={labelClass} htmlFor="title">
              Título
            </label>
            <input id="title" type="text" className={inputClass} {...register('title')} />
            {errors.title && <p className="mt-1 text-sm text-priority-critical">{errors.title.message}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="description">
              Descripción
            </label>
            <textarea id="description" rows={5} className={inputClass} {...register('description')} />
            {errors.description && (
              <p className="mt-1 text-sm text-priority-critical">{errors.description.message}</p>
            )}
          </div>
        </section>

        {isAdmin && (
          <section className="space-y-4 rounded-lg border border-surface-border bg-surface-1 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Asignación (opcional)
            </h2>
            <div>
              <label className={labelClass} htmlFor="assignedToId">
                Asignar a
              </label>
              <select id="assignedToId" className={inputClass} {...register('assignedToId')}>
                <option value="">Auto-asignar según la regla de la subcategoría</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </section>
        )}

        {serverError && <p className="text-sm text-priority-critical">{serverError}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Creando…' : 'Crear ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}
