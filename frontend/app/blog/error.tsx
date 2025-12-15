'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Server } from 'lucide-react'
import Link from 'next/link'

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Blog Error:', error)
  }, [error])

  const isConnectionError =
    error.message.includes('Strapi API') ||
    error.message.includes('اتصال') ||
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('fetch failed')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                خطا در بارگذاری وبلاگ
              </h1>
              <p className="text-muted-foreground">
                {isConnectionError
                  ? 'نمی‌توان به سرور Strapi متصل شد'
                  : 'خطایی در دریافت اطلاعات رخ داده است'}
              </p>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="w-full bg-muted/50 rounded-lg p-4 text-right">
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {error.message}
                </p>
              </div>
            )}

            {/* Instructions for Connection Error */}
            {isConnectionError && (
              <div className="w-full bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4 text-right">
                <div className="flex items-start gap-3">
                  <Server className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      راه‌حل:
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>
                        مطمئن شوید که سرور Strapi در حال اجرا است:
                        <code className="block mt-1 bg-background px-2 py-1 rounded text-xs font-mono">
                          cd blog-api && npm run develop
                        </code>
                      </li>
                      <li>
                        بررسی کنید که Strapi روی پورت صحیح اجرا می‌شود (معمولاً 1337)
                      </li>
                      <li>
                        فایل <code className="bg-background px-1 rounded text-xs">frontend/.env.local</code> را بررسی کنید:
                        <code className="block mt-1 bg-background px-2 py-1 rounded text-xs font-mono">
                          NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
                        </code>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                تلاش مجدد
              </button>
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

