import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface ToastMessage {
  id: number
  text: string
  kind: 'success' | 'error'
}

interface ToastContextValue {
  showToast: (text: string, kind?: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const showToast = useCallback((text: string, kind: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random()
    setMessages((prev) => [...prev, { id, text, kind }])
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-md border px-4 py-2 text-sm shadow-lg ${
              m.kind === 'success'
                ? 'border-status-resolved/40 bg-status-resolved-bg text-status-resolved'
                : 'border-priority-critical/40 bg-status-pending-bg text-priority-critical'
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider')
  }
  return context
}
