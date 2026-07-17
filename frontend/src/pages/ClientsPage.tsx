import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { extractErrorMessage } from '../api/client'
import { useClients, useCreateClient, useDeleteClient, useUpdateClient } from '../api/clients'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'
import type { Client } from '../types/client'

const clientSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().min(1, 'El correo es obligatorio').email('Correo inválido'),
  company: z.string().optional(),
  phone: z.string().optional(),
})

type ClientFormValues = z.infer<typeof clientSchema>

const inputClass =
  'mt-1 w-full rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'
const labelClass = 'block text-sm font-medium text-text-secondary'

export function ClientsPage() {
  const { data: clients, isLoading } = useClients()
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()
  const { showToast } = useToast()

  const [editing, setEditing] = useState<Client | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const closeModal = () => {
    setEditing(null)
    setIsCreating(false)
  }

  const handleDelete = async (client: Client) => {
    if (!confirm(`¿Eliminar a ${client.name}?`)) return
    try {
      await deleteClient.mutateAsync(client.id)
      showToast('Cliente eliminado')
    } catch (error) {
      showToast(extractErrorMessage(error, 'No se pudo eliminar el cliente'), 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Clientes</h1>
          <p className="mt-1 text-sm text-text-muted">Gestiona los clientes de la plataforma.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Nuevo cliente
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-surface-border bg-surface-1">
        {isLoading ? (
          <p className="px-4 py-6 text-sm text-text-muted">Cargando…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Empresa</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Teléfono</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {(clients ?? []).map((client) => (
                <tr key={client.id} className="border-t border-surface-border hover:bg-surface-2">
                  <td className="px-4 py-3 font-medium text-text-primary">{client.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{client.company ?? '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">{client.email}</td>
                  <td className="px-4 py-3 text-text-secondary">{client.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(client)}
                      className="mr-3 text-brand-400 hover:text-brand-300"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(client)}
                      className="text-priority-critical hover:opacity-80"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(isCreating || editing) && (
        <ClientFormModal
          client={editing}
          onClose={closeModal}
          onSubmit={async (values) => {
            try {
              if (editing) {
                await updateClient.mutateAsync({ id: editing.id, input: values })
                showToast('Cliente actualizado')
              } else {
                await createClient.mutateAsync(values)
                showToast('Cliente creado')
              }
              closeModal()
            } catch (error) {
              throw new Error(extractErrorMessage(error, 'No se pudo guardar el cliente'))
            }
          }}
        />
      )}
    </div>
  )
}

function ClientFormModal({
  client,
  onClose,
  onSubmit,
}: {
  client: Client | null
  onClose: () => void
  onSubmit: (values: ClientFormValues) => Promise<void>
}) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
      ? { name: client.name, email: client.email, company: client.company ?? '', phone: client.phone ?? '' }
      : undefined,
  })

  const submit = async (values: ClientFormValues) => {
    setServerError(null)
    try {
      await onSubmit(values)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'No se pudo guardar el cliente')
    }
  }

  return (
    <Modal title={client ? 'Editar cliente' : 'Nuevo cliente'} onClose={onClose}>
      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="name">
            Nombre
          </label>
          <input id="name" className={inputClass} {...register('name')} />
          {errors.name && <p className="mt-1 text-sm text-priority-critical">{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input id="email" type="email" className={inputClass} {...register('email')} />
          {errors.email && <p className="mt-1 text-sm text-priority-critical">{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="company">
            Empresa
          </label>
          <input id="company" className={inputClass} {...register('company')} />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">
            Teléfono
          </label>
          <input id="phone" className={inputClass} {...register('phone')} />
        </div>
        {serverError && <p className="text-sm text-priority-critical">{serverError}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  )
}
