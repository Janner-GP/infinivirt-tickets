import type { UserRole } from '../auth/AuthContext'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
  clientId: string | null
}
