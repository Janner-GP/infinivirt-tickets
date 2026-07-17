import { useMemo, useState } from 'react'
import {
  useAssignmentRules,
  useCategories,
  useCreateCategory,
  useCreateSubcategory,
  useDeleteCategory,
  useDeleteSubcategory,
  useSetAssignmentRule,
} from '../api/categories'
import { extractErrorMessage } from '../api/client'
import { useUsers } from '../api/users'
import { useToast } from '../components/Toast'

const inputClass =
  'h-9 rounded-md border border-surface-border bg-surface-2 px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const { data: rules } = useAssignmentRules()
  const { data: users } = useUsers()
  const { showToast } = useToast()

  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()
  const createSubcategory = useCreateSubcategory()
  const deleteSubcategory = useDeleteSubcategory()
  const setAssignmentRule = useSetAssignmentRule()

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newSubcategoryName, setNewSubcategoryName] = useState<Record<string, string>>({})

  const agents = useMemo(() => (users ?? []).filter((u) => u.role === 'AGENT'), [users])
  const ruleBySubcategory = useMemo(
    () => new Map((rules ?? []).map((rule) => [rule.subcategoryId, rule])),
    [rules],
  )

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      await createCategory.mutateAsync(newCategoryName)
      setNewCategoryName('')
      showToast('Categoría creada')
    } catch (error) {
      showToast(extractErrorMessage(error, 'No se pudo crear la categoría'), 'error')
    }
  }

  const handleAddSubcategory = async (categoryId: string) => {
    const name = newSubcategoryName[categoryId]?.trim()
    if (!name) return
    try {
      await createSubcategory.mutateAsync({ categoryId, name })
      setNewSubcategoryName((prev) => ({ ...prev, [categoryId]: '' }))
      showToast('Subcategoría creada')
    } catch (error) {
      showToast(extractErrorMessage(error, 'No se pudo crear la subcategoría'), 'error')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      await deleteCategory.mutateAsync(id)
    } catch (error) {
      showToast(extractErrorMessage(error, 'No se pudo eliminar la categoría'), 'error')
    }
  }

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm('¿Eliminar esta subcategoría?')) return
    try {
      await deleteSubcategory.mutateAsync(id)
    } catch (error) {
      showToast(extractErrorMessage(error, 'No se pudo eliminar la subcategoría'), 'error')
    }
  }

  const handleRuleChange = async (subcategoryId: string, agentId: string) => {
    if (!agentId) return
    const existing = ruleBySubcategory.get(subcategoryId)
    try {
      await setAssignmentRule.mutateAsync({ existingRuleId: existing?.id, subcategoryId, agentId })
      showToast('Agente responsable actualizado')
    } catch (error) {
      showToast(extractErrorMessage(error, 'No se pudo asignar el agente'), 'error')
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-text-primary">Categorías y subcategorías</h1>
      <p className="mt-1 text-sm text-text-muted">
        Define la taxonomía de tickets y el agente responsable de cada subcategoría.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nombre de la nueva categoría"
          className={`${inputClass} w-72`}
        />
        <button
          type="button"
          onClick={handleAddCategory}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Categoría
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="text-sm text-text-muted">Cargando…</p>
        ) : (
          (categories ?? []).map((category) => (
            <div key={category.id} className="overflow-hidden rounded-lg border border-surface-border bg-surface-1">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggle(category.id)}
                  className="flex items-center gap-2 text-sm font-semibold text-text-primary"
                >
                  <span className="text-text-muted">{expanded.has(category.id) ? '▾' : '▸'}</span>
                  {category.name}
                  <span className="text-xs font-normal text-text-muted">
                    {category.subcategories?.length ?? 0} subcategorías
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-xs text-priority-critical hover:opacity-80"
                >
                  Eliminar
                </button>
              </div>

              {expanded.has(category.id) && (
                <div className="border-t border-surface-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-text-muted">
                        <th className="px-4 py-2 font-medium">Subcategoría</th>
                        <th className="px-4 py-2 font-medium">Agente responsable</th>
                        <th className="px-4 py-2 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {(category.subcategories ?? []).map((sub) => (
                        <tr key={sub.id} className="border-t border-surface-border">
                          <td className="px-4 py-2 text-text-primary">{sub.name}</td>
                          <td className="px-4 py-2">
                            <select
                              value={ruleBySubcategory.get(sub.id)?.agentId ?? ''}
                              onChange={(e) => handleRuleChange(sub.id, e.target.value)}
                              className={inputClass}
                            >
                              <option value="">Sin configurar</option>
                              {agents.map((agent) => (
                                <option key={agent.id} value={agent.id}>
                                  {agent.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteSubcategory(sub.id)}
                              className="text-xs text-priority-critical hover:opacity-80"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex gap-2 border-t border-surface-border px-4 py-3">
                    <input
                      value={newSubcategoryName[category.id] ?? ''}
                      onChange={(e) =>
                        setNewSubcategoryName((prev) => ({ ...prev, [category.id]: e.target.value }))
                      }
                      placeholder="Nueva subcategoría"
                      className={`${inputClass} w-64`}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSubcategory(category.id)}
                      className="rounded-md border border-surface-border px-3 text-sm font-medium text-text-secondary hover:bg-surface-2"
                    >
                      + Subcategoría
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
