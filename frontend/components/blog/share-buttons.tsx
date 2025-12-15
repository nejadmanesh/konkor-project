'use client'

import { Button } from '@/components/ui/button'
import { Share2, Copy, Check, Twitter, Linkedin, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ShareButtonsProps {
  title: string
  url: string
  excerpt?: string
}

export function ShareButtons({ title, url, excerpt }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [hasShareAPI, setHasShareAPI] = useState(false)
  const [fullUrl, setFullUrl] = useState(url)

  useEffect(() => {
    // Set full URL and check for share API only on client side
    if (typeof window !== 'undefined') {
      setFullUrl(window.location.href)
      setHasShareAPI(typeof navigator !== 'undefined' && 'share' in navigator)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareData = {
    title,
    text: excerpt || title,
    url: fullUrl,
  }

  const handleShare = async () => {
    if (hasShareAPI && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or error occurred, fallback to copy
        if ((err as Error).name !== 'AbortError') {
          handleCopy()
        }
      }
    } else {
      handleCopy()
    }
  }

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`
    window.open(linkedInUrl, '_blank', 'width=550,height=420')
  }

  const shareToTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`
    window.open(telegramUrl, '_blank', 'width=550,height=420')
  }

  return (
    <div className="flex flex-wrap items-center gap-4 p-5 bg-gradient-to-br from-muted/50 to-muted rounded-xl border border-border/50">
      <div className="flex items-center gap-3 text-base font-medium text-foreground">
        <Share2 className="w-5 h-5" />
        <span>اشتراک‌گذاری</span>
      </div>
      <div className="flex items-center gap-3 flex-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex-1 hover:bg-primary/10 hover:border-primary/50 transition-all"
        >
          {hasShareAPI ? (
            <>
              <Share2 className="w-5 h-5 ml-3" />
              اشتراک
            </>
          ) : (
            <>
              {copied ? (
                <>
                  <Check className="w-5 h-5 ml-3" />
                  کپی شد!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 ml-3" />
                  کپی لینک
                </>
              )}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={shareToTwitter}
          className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/20 dark:hover:border-blue-800 transition-all"
          title="اشتراک در توییتر"
        >
          <Twitter className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={shareToLinkedIn}
          className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/20 dark:hover:border-blue-800 transition-all"
          title="اشتراک در لینکدین"
        >
          <Linkedin className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={shareToTelegram}
          className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/20 dark:hover:border-blue-800 transition-all"
          title="اشتراک در تلگرام"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}

