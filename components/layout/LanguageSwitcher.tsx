'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

const LOCALES = [
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSelect(code: string) {
    if (code === locale) { setOpen(false); return }
    setLoading(true)
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: code }),
    })
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors disabled:opacity-50"
      >
        <GlobeIcon />
        <span>{LOCALES.find(l => l.code === locale)?.label}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 bg-card border border-[#E8E0D8] rounded-xl shadow-lg overflow-hidden z-50 min-w-[110px]">
            {LOCALES.map(l => (
              <button
                key={l.code}
                onClick={() => handleSelect(l.code)}
                className={`w-full px-4 py-3 text-sm text-left hover:bg-[#F0E9E2] transition-colors ${
                  l.code === locale ? 'text-accent font-medium' : 'text-primary'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
}
