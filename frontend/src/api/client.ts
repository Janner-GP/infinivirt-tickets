import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

export interface ApiEnvelope<T> {
  success: true
  statusCode: number
  data: T
  timestamp: string
}

export function unwrap<T>(response: { data: ApiEnvelope<T> }): T {
  return response.data.data
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string | string[] } } }).response?.data
      ?.message !== 'undefined'
  ) {
    const message = (error as { response: { data: { message: string | string[] } } }).response.data
      .message
    return Array.isArray(message) ? message.join(', ') : message
  }
  return fallback
}
