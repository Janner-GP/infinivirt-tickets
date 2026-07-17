import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserRole } from '../auth/AuthContext'
import type { User } from '../types/user'
import { apiClient, unwrap } from './client'

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: UserRole
  clientId?: string
}

function fetchUsers() {
  return apiClient.get('/users').then(unwrap<User[]>)
}

export function useUsers(enabled = true) {
  return useQuery({ queryKey: ['users'], queryFn: fetchUsers, enabled })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateUserInput) => apiClient.post('/users', input).then(unwrap<User>),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}
