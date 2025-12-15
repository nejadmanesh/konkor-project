'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BlogNavigation } from '@/lib/api'
import { cn } from '@/lib/utils'

interface CategoryFilterBarProps {
  navigation: BlogNavigation
}

export function CategoryFilterBar({ navigation }: CategoryFilterBarProps) {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')

  const filterItems = navigation.filterMenuItems
    .sort((a, b) => a.order - b.order)
    .filter((item) => item.isActive)

  if (filterItems.length === 0) {
    return null
  }

  return (
    <nav className="border-b border-border bg-secondary/30 backdrop-blur">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {filterItems.map((item) => {
            const categorySlug = item.category?.slug || item.url.replace('/blog?category=', '')
            const isActive = currentCategory === categorySlug

            return (
              <Link
                key={item.id}
                href={item.category ? `/blog?category=${categorySlug}` : item.url}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  'hover:bg-primary/10 hover:text-primary',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-background/50 text-foreground/80 hover:bg-background/80'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}


















