export interface ContextItem {
  id: string
  title: string
  content: string
  type: 'rule' | 'documentation' | 'snippet' | 'note' | 'reference'
  tags: string[]
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  relatedFiles?: string[]
  metadata?: Record<string, any>
}

export interface ContextCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
  itemCount: number
}

export interface ContextSearchFilters {
  type?: string[]
  category?: string[]
  tags?: string[]
  priority?: string[]
  isActive?: boolean
  searchTerm?: string
}

export interface ContextStats {
  totalItems: number
  activeItems: number
  itemsByType: Record<string, number>
  itemsByCategory: Record<string, number>
  recentItems: ContextItem[]
}

export interface ContextExport {
  version: string
  exportedAt: string
  items: ContextItem[]
  categories: ContextCategory[]
} 