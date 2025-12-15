import type React from "react"
import type { Metadata } from "next"
import { Vazirmatn } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import LivePreview from "@/components/live-preview"

const vazirmatn = Vazirmatn({ subsets: ["arabic", "latin"] })

export const metadata: Metadata = {
  title: "برنامه‌ریز هوشمند کنکور | مطالعه با هوش مصنوعی",
  description: "برنامه‌ریزی هوشمند برای موفقیت در کنکور با کمک هوش مصنوعی",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.className} font-sans antialiased`}>
        {children}
        <LivePreview />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
