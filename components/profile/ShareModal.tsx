'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { QRCodeSVG } from 'qrcode.react'

type Props = {
  userId: string
  username: string
}

export default function ShareModal({ userId, username }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [profileUrl, setProfileUrl] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setProfileUrl(`${window.location.origin}/profile/${userId}`)
  }, [userId])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profileUrl)
    } catch {
      const el = document.createElement('input')
      el.value = profileUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const modal = open ? (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50"
      style={{ backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
    >
      <div className="w-full max-w-lg bg-[#F5EFE8] rounded-t-3xl shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#D4C9BE] rounded-full" />
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-mincho text-base text-primary">プロフィールをシェア</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-muted hover:text-primary transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center px-6 pb-10">
          <div className="bg-white p-5 rounded-2xl shadow-sm mb-4">
            {profileUrl && (
              <QRCodeSVG
                value={profileUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#2C1810"
                level="M"
              />
            )}
          </div>

          <p className="font-mincho text-primary text-base mb-6">@{username}</p>

          <div className="w-full flex gap-2 mb-3">
            <div className="flex-1 bg-white border border-[#E8E0D8] rounded-xl px-4 py-3 text-xs text-muted truncate flex items-center">
              {profileUrl}
            </div>
            <button
              onClick={handleCopy}
              className={`flex-shrink-0 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-accent text-white hover:bg-[#C05530]'
              }`}
            >
              {copied ? '✓ コピー済み' : 'コピー'}
            </button>
          </div>

          <p className="text-xs text-[#B0A098] text-center">
            QRコードを読み取るか、リンクをコピーして共有できます
          </p>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        シェア
      </button>

      {mounted && createPortal(modal, document.body)}
    </>
  )
}
