'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Search, User, Grid3x3, GraduationCap } from 'lucide-react'
import { BlogNavigation } from '@/lib/api'
import { useStudentStore } from '@/lib/store'
import { useState, useEffect } from 'react'
import { SearchModal } from './search-modal'

interface BlogHeaderProps {
  navigation: BlogNavigation
}

export function BlogHeader({ navigation }: BlogHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { name } = useStudentStore()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null
    setIsAuthenticated(!!token)
  }, [])

  const handleCreatePlanClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      router.push('/login?redirect=/planner/create')
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Main Navigation Bar */}
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground leading-tight">
                  کنکور AI
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  برنامه ریز هوشمند
                </span>
              </div>
            </Link>
            <Button
              asChild
              onClick={handleCreatePlanClick}
              className="hidden md:flex bg-gradient-to-l from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Link href={isAuthenticated ? '/planner/create' : '/login?redirect=/planner/create'}>
                ساخت برنامه درسی رایگان
              </Link>
            </Button>
          </div>

          {/* Main Menu Links */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            {navigation.mainMenuItems
              .sort((a, b) => a.order - b.order)
              .map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    target={item.openInNewTab ? '_blank' : undefined}
                    rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive
                        ? 'text-primary border-b-2 border-primary pb-1'
                        : 'text-foreground/80'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              aria-label="جستجو"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              aria-label="منوی بیشتر"
            >
              <Grid3x3 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="پروفایل کاربر"
            >
              <Link href={isAuthenticated ? '/profile' : '/login'}>
                <User className="w-5 h-5" />
              </Link>
            </Button>
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="منوی موبایل"
            >
              <Grid3x3 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}

