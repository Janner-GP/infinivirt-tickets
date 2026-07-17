export interface Subcategory {
  id: string
  categoryId: string
  name: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  createdAt: string
  subcategories?: Subcategory[]
}

export interface AssignmentRule {
  id: string
  subcategoryId: string
  subcategoryName?: string
  categoryId?: string
  categoryName?: string
  agentId: string
  agentName?: string
  agentEmail?: string
  createdAt: string
}
