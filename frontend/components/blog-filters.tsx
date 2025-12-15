'use client'

import { Category } from '@/lib/api'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { useState } from 'react'

interface BlogFiltersProps {
  categories: Category[]
  currentFilters: {
    search?: string
    category?: string
    grade?: string
    field?: string
    ordering?: string
    tag?: string
  }
}

export function BlogFilters({ categories, currentFilters }: BlogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) params.set('search', searchQuery)
    else params.delete('search')
    params.delete('page')
    router.push(`/blog?${params.toString()}`)
  }

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`/blog?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery('')
    router.push('/blog')
  }

  const grades = [
    { value: '10', label: 'دهم' },
    { value: '11', label: 'یازدهم' },
    { value: '12', label: 'دوازدهم' },
    { value: 'konkur', label: 'کنکور' },
  ]

  const fields = [
    { value: 'riazi', label: 'ریاضی' },
    { value: 'tajrobi', label: 'تجربی' },
    { value: 'ensani', label: 'انسانی' },
  ]

  const sortOptions = [
    { value: '-published_at', label: 'جدیدترین' },
    { value: '-view_count', label: 'محبوب‌ترین' },
    { value: 'reading_time', label: 'کوتاه‌ترین' },
    { value: '-reading_time', label: 'طولانی‌ترین' },
  ]

  return (
    <div className="bg-card rounded-lg p-7 border border-border">
      <form onSubmit={handleSearch} className="mb-7">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="text" placeholder="جستجو در مقالات..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10" />
          </div>
          <Button type="submit">جستجو</Button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium mb-2 block">دسته‌بندی</label>
          <select value={currentFilters.category || ''} onChange={(e) => handleFilterChange('category', e.target.value)} className="w-full px-3 py-2 border border-input rounded-md bg-background">
            <option value="">همه دسته‌ها</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">پایه تحصیلی</label>
          <select value={currentFilters.grade || ''} onChange={(e) => handleFilterChange('grade', e.target.value)} className="w-full px-3 py-2 border border-input rounded-md bg-background">
            <option value="">همه پایه‌ها</option>
            {grades.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">رشته</label>
          <select value={currentFilters.field || ''} onChange={(e) => handleFilterChange('field', e.target.value)} className="w-full px-3 py-2 border border-input rounded-md bg-background">
            <option value="">همه رشته‌ها</option>
            {fields.map((field) => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">مرتب‌سازی</label>
          <select value={currentFilters.ordering || '-published_at'} onChange={(e) => handleFilterChange('ordering', e.target.value)} className="w-full px-3 py-2 border border-input rounded-md bg-background">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(currentFilters.search || currentFilters.category || currentFilters.grade || currentFilters.field || currentFilters.tag) && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            پاک کردن فیلترها
          </Button>
        </div>
      )}
    </div>
  )
}