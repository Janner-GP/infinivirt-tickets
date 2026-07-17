import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Client } from '../types/client'
import { apiClient, unwrap } from './client'

export interface ClientInput {
  name: string
  email: string
  company?: string
  phone?: string
}

function fetchClients() {
  return apiClient.get('/clients').then(unwrap<Client[]>)
}

export function useClients(enabled = true) {
  return useQuery({ queryKey: ['clients'], queryFn: fetchClients, enabled })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ClientInput) => apiClient.post('/clients', input).then(unwrap<Client>),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ClientInput> }) =>
      apiClient.patch(`/clients/${id}`, input).then(unwrap<Client>),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/clients/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })
}
