import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useClients } from '../api/clients'
import { extractErrorMessage } from '../api/client'
import { useCreateUser, useUsers } from '../api/users'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'

const userSchema = z
  .object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    email: z.string().min(1, 'El correo es obligatorio').email('Correo inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    role: z.enum(['ADMIN', 'AGENT', 'SUPERVISOR', 'CLIENT']),
    clientId: z.string().optional(),
  })
  .refine((data) => data.role !== 'CLIENT' || !!data.clientId, {
    message: 'Selecciona el cliente al que se vincula esta cuenta',
    path: ['clientId'],
  })

type UserFormValues = z.infer<typeof userSchema>

const inputClass =
  'mt-1 w-full rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'
const labelClass = 'block text-sm font-medium text-text-secondary'

export function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const { data: clients } = useClients()
  const createUser = useCreateUser()
  const { showToast } = useToast()
  const [isCreating, setIsCreating] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({ resolver: zodResolver(userSchema), defaultValues: { role: 'AGENT' } })
  const [serverError, setServerError] = useState<string | null>(null)
  const selectedRole = watch('role')

  const closeModal = () => {
    setIsCreating(false)
    reset({ role: 'AGENT', name: '', email: '', password: '', clientId: '' })
    setServerError(null)
  }

  const onSubmit = async (values: UserFormValues) => {
    setServerError(null)
    try {
      await createUser.mutateAsync(values)
      showToast('Usuario creado')
      closeModal()
    } catch (error) {
      setServerError(extractErrorMessage(error, 'No se pudo crear el usuario'))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Usuarios</h1>
          <p className="mt-1 text-sm text-text-muted">
            Crea cuentas de Administrador, Agente, Supervisor o Cliente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Nuevo usuario
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
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Rol</th>
                <th className="px-4 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr key={u.id} className="border-t border-surface-border hover:bg-surface-2">
                  <td className="px-4 py-3 font-medium text-text-primary">{u.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.role}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.isActive ? 'Activo' : 'Inactivo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isCreating && (
        <Modal title="Nuevo usuario" onClose={closeModal}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
              <label className={labelClass} htmlFor="password">
                Contraseña temporal
              </label>
              <input id="password" type="password" className={inputClass} {...register('password')} />
              {errors.password && (
                <p className="mt-1 text-sm text-priority-critical">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="role">
                Rol
              </label>
              <select id="role" className={inputClass} {...register('role')}>
                <option value="ADMIN">Administrador</option>
                <option value="AGENT">Agente</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="CLIENT">Cliente</option>
              </select>
            </div>
            {selectedRole === 'CLIENT' && (
              <div>
                <label className={labelClass} htmlFor="clientId">
                  Cliente a vincular
                </label>
                <select id="clientId" className={inputClass} {...register('clientId')}>
                  <option value="">Selecciona un cliente…</option>
                  {(clients ?? []).map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="mt-1 text-sm text-priority-critical">{errors.clientId.message}</p>
                )}
              </div>
            )}
            {serverError && <p className="text-sm text-priority-critical">{serverError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
              >
                Crear usuario
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
