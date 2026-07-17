import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth, type UserRole } from '../auth/AuthContext'

interface NavItem {
  to: string
  label: string
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'SUPERVISOR'] },
  { to: '/tickets', label: 'Tickets', roles: ['ADMIN', 'AGENT', 'SUPERVISOR'] },
  { to: '/clients', label: 'Clientes', roles: ['ADMIN', 'SUPERVISOR'] },
  { to: '/categories', label: 'Categorías', roles: ['ADMIN'] },
  { to: '/users', label: 'Usuarios', roles: ['ADMIN'] },
]

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand-600/15 text-brand-400'
      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
  }`

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  if (user.role === 'CLIENT') {
    return (
      <div className="min-h-screen bg-surface-0">
        <header className="flex items-center justify-between border-b border-surface-border bg-surface-1 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-xs font-semibold text-white">
              IV
            </span>
            <span className="text-sm font-semibold text-text-primary">Infinivirt</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>{user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md px-3 py-1.5 font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            >
              Salir
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-8">
          <Outlet />
        </main>
      </div>
    )
  }

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role))

  return (
    <div className="flex min-h-screen bg-surface-0">
      <aside className="flex w-56 flex-col border-r border-surface-border bg-surface-1 px-3 py-4">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-xs font-semibold text-white">
            IV
          </span>
          <span className="text-sm font-semibold text-text-primary">Infinivirt</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {visibleItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navItemClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-surface-border pt-3">
          <p className="px-2 text-sm text-text-primary">{user.name}</p>
          <p className="px-2 text-xs text-text-muted">{user.role}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 w-full rounded-md px-2 py-1.5 text-left text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary"
          >
            Salir
          </button>
        </div>
      </aside>
      <main className="flex-1 px-8 py-6">
        <Outlet />
      </main>
    </div>
  )
}
