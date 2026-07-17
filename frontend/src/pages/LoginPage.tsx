import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { login as loginRequest } from '../api/auth'
import { useAuth, type UserRole } from '../auth/AuthContext'

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio').email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

function homeRouteForRole(role: UserRole): string {
  return role === 'ADMIN' || role === 'SUPERVISOR' ? '/dashboard' : '/tickets'
}

export function LoginPage() {
  const { isAuthenticated, user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  if (isAuthenticated && user) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? homeRouteForRole(user.role)
    return <Navigate to={redirectTo} replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    try {
      const { user: loggedUser, accessToken, refreshToken } = await loginRequest(
        values.email,
        values.password,
      )
      login(loggedUser, accessToken, refreshToken)
      navigate(homeRouteForRole(loggedUser.role), { replace: true })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setServerError('Correo o contraseña incorrectos.')
      } else {
        setServerError('Ocurrió un error al iniciar sesión. Intenta de nuevo.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-4">
      <div className="w-full max-w-sm rounded-lg border border-surface-border bg-surface-1 p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-sm font-semibold text-white">
            IV
          </span>
          <h1 className="text-center text-xl font-semibold text-text-primary">Infinivirt Support</h1>
          <p className="mt-1 text-center text-sm text-text-muted">Plataforma de gestión de tickets</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="mt-1 w-full rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-sm text-priority-critical">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-priority-critical">{errors.password.message}</p>
            )}
          </div>

          {serverError && <p className="text-sm text-priority-critical">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
