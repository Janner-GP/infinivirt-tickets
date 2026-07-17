import { useMutation } from '@tanstack/react-query'
import type { UserRole } from '../auth/AuthContext'
import { apiClient, unwrap } from './client'

export interface LoginResponse {
  user: { id: string; name: string; email: string; role: UserRole }
  accessToken: string
  refreshToken: string
}

export function login(email: string, password: string) {
  return apiClient
    .post<{ data: LoginResponse; success: true; statusCode: number; timestamp: string }>(
      '/auth/login',
      { email, password },
    )
    .then(unwrap<LoginResponse>)
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
  })
}
