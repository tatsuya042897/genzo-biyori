import type { Metadata, Viewport } from "next"
import "./globals.css"
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

export const metadata: Metadata = {
  title: "現像日和",
  description: "フィルム写真愛好家のためのリアルタイム共有SNS",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "現像日和" },
  icons: { icon: "/icons/icon-192x192.png", apple: "/icons/icon-192x192.png" },
}

export const viewport: Viewport = {
  themeColor: "#F8F4EE",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="bg-background min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
