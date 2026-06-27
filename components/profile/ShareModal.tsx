'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

type Props = {
  userId: string
  username: string
}

export default function ShareModal({ userId, username }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [profileUrl, setProfileUrl] = useState('')

  useEffect(() => {
    setProfileUrl(`${window.location.origin}/profile/${userId}`)
  }, [userId])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = profileUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleNativeShare() {
    if (navigator.share) {
      navigator.share({ title: `${username} - 現像日和`, url: profileUrl })
    }
  }

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

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-lg bg-card rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mincho text-base text-primary">プロフィールをシェア</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-primary transition-colors p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                {profileUrl && (
                  <QRCodeSVG
                    value={profileUrl}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#2C1810"
                    level="M"
                  />
                )}
              </div>
            </div>

            <p className="text-center text-xs text-muted mb-6">@{username}</p>

            {/* URL */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 bg-background border border-[#E8E0D8] rounded-lg px-3 py-2.5 text-xs text-muted truncate">
                {profileUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-accent text-white hover:bg-[#C05530]'
                }`}
              >
                {copied ? 'コピー済み' : 'コピー'}
              </button>
            </div>

            {/* Native share (mobile) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full border border-[#E8E0D8] rounded-lg py-2.5 text-sm text-muted hover:text-primary hover:border-accent transition-colors"
              >
                その他のアプリでシェア
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
