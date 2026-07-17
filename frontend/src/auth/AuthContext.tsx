import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type UserRole = 'ADMIN' | 'AGENT' | 'SUPERVISOR' | 'CLIENT'

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthContextValue {
  user: AuthenticatedUser | null
  isAuthenticated: boolean
  login: (user: AuthenticatedUser, accessToken: string, refreshToken: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? (JSON.parse(stored) as AuthenticatedUser) : null
  })

  const login = (nextUser: AuthenticatedUser, accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
