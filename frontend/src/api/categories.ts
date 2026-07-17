import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AssignmentRule, Category, Subcategory } from '../types/category'
import { apiClient, unwrap } from './client'

function fetchCategories() {
  return apiClient.get('/categories').then(unwrap<Category[]>)
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => apiClient.post('/categories', { name }).then(unwrap<Category>),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useCreateSubcategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, name }: { categoryId: string; name: string }) =>
      apiClient
        .post(`/categories/${categoryId}/subcategories`, { name })
        .then(unwrap<Subcategory>),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteSubcategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/subcategories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['assignment-rules'] })
    },
  })
}

function fetchAssignmentRules() {
  return apiClient.get('/assignment-rules').then(unwrap<AssignmentRule[]>)
}

export function useAssignmentRules() {
  return useQuery({ queryKey: ['assignment-rules'], queryFn: fetchAssignmentRules })
}

export function useSetAssignmentRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      existingRuleId,
      subcategoryId,
      agentId,
    }: {
      existingRuleId?: string
      subcategoryId: string
      agentId: string
    }) =>
      existingRuleId
        ? apiClient
            .patch(`/assignment-rules/${existingRuleId}`, { agentId })
            .then(unwrap<AssignmentRule>)
        : apiClient
            .post('/assignment-rules', { subcategoryId, agentId })
            .then(unwrap<AssignmentRule>),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignment-rules'] }),
  })
}
