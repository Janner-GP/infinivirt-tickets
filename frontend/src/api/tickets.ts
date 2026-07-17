import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { DashboardMetrics, Ticket, TicketPriority, TicketStatus } from '../types/ticket'
import { apiClient, unwrap } from './client'

export interface TicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  clientId?: string
  assignedToId?: string
  categoryId?: string
  subcategoryId?: string
}

export interface CreateTicketInput {
  clientId?: string
  categoryId: string
  subcategoryId: string
  title: string
  description: string
  priority: TicketPriority
  assignedToId?: string
}

function fetchTickets(filters: TicketFilters) {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
  return apiClient.get('/tickets', { params }).then(unwrap<Ticket[]>)
}

export function useTickets(filters: TicketFilters) {
  return useQuery({ queryKey: ['tickets', filters], queryFn: () => fetchTickets(filters) })
}

export function useOverdueTickets() {
  return useQuery({ queryKey: ['tickets', 'overdue'], queryFn: () => apiClient.get('/tickets/overdue').then(unwrap<Ticket[]>) })
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['tickets', 'metrics'],
    queryFn: () => apiClient.get('/tickets/metrics').then(unwrap<DashboardMetrics>),
  })
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => apiClient.get(`/tickets/${id}`).then(unwrap<Ticket>),
    enabled: !!id,
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTicketInput) => apiClient.post('/tickets', input).then(unwrap<Ticket>),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  })
}

export function useUpdateTicketFields(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { title?: string; description?: string; priority?: TicketPriority }) =>
      apiClient.patch(`/tickets/${id}`, input).then(unwrap<Ticket>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', id] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useUpdateTicketStatus(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: TicketStatus) =>
      apiClient.patch(`/tickets/${id}/status`, { status }).then(unwrap<Ticket>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', id] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useAssignTicket(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (assignedToId: string) =>
      apiClient.patch(`/tickets/${id}/assign`, { assignedToId }).then(unwrap<Ticket>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', id] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useAddComment(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { content: string; isInternal?: boolean }) =>
      apiClient.post(`/tickets/${id}/comments`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets', id] }),
  })
}
