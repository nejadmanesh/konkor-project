'use client'

import { useEffect, useState } from 'react'

interface TOCItem {
  id: string
  text: string
}

export default function TableOfContents({ toc }: { toc: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>('')

  // اضافه کردن id به headings در DOM اگر وجود نداشته باشد
  useEffect(() => {
    if (toc.length === 0) return

    const ensureHeadingIds = () => {
      toc.forEach((item) => {
        // پیدا کردن heading در DOM بر اساس متن
        const headings = document.querySelectorAll('h2')
        headings.forEach((heading) => {
          const headingText = heading.textContent?.trim()
          if (headingText === item.text && !heading.id) {
            heading.id = item.id
          }
        })
      })
    }

    // صبر کردن تا DOM render شود
    const timeoutId = setTimeout(ensureHeadingIds, 100)
    
    return () => clearTimeout(timeoutId)
  }, [toc])

  useEffect(() => {
    if (toc.length === 0) return

    const handleScroll = () => {
      let current = ''
      toc.forEach((item) => {
        const element = document.getElementById(item.id)
        if (element) {
          const offset = element.getBoundingClientRect().top
          if (offset < window.innerHeight * 0.3) {
            current = item.id
          }
        }
      })
      setActiveId(current)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // برای تنظیم initial state
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [toc])

  if (toc.length === 0) return null

  return (
    <aside className="hidden lg:block sticky top-24 w-64 h-fit bg-card p-5 rounded-xl border border-border shadow-sm">
      <h3 className="font-bold text-lg mb-4 text-foreground">فهرست مطالب</h3>
      <ul className="space-y-2 text-sm rtl:text-right">
        {toc.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById(item.id)
                if (element) {
                  const offset = 100 // فاصله از بالای صفحه
                  const elementPosition = element.getBoundingClientRect().top
                  const offsetPosition = elementPosition + window.pageYOffset - offset
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                  })
                }
              }}
              className={`block transition-all hover:text-primary rtl:text-right ${
                activeId === item.id ? 'text-primary font-bold' : 'text-muted-foreground'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

