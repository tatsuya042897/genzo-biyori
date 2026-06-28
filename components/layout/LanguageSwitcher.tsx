'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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

  const modal = open ? (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50"
      style={{ backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
    >
      <div className="w-full max-w-lg bg-[#F5EFE8] rounded-t-3xl shadow-2xl pb-8">
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 bg-[#D4C9BE] rounded-full" />
        </div>
        {LOCALES.map(l => (
          <button
            key={l.code}
            onClick={() => handleSelect(l.code)}
            className={`w-full px-6 py-4 text-base text-left border-b border-[#E8E0D8]/60 last:border-0 hover:bg-[#F0E9E2] transition-colors ${
              l.code === locale ? 'text-accent font-medium' : 'text-primary'
            }`}
          >
            {l.label}
            {l.code === locale && <span className="float-right text-accent">✓</span>}
          </button>
        ))}
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors disabled:opacity-50"
      >
        <GlobeIcon />
        <span>{LOCALES.find(l => l.code === locale)?.label}</span>
      </button>
      {mounted && createPortal(modal, document.body)}
    </>
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
