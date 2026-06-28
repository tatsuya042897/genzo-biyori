'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase-browser'
import Logo from '@/components/layout/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const t = useTranslations('auth')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(t('login_error')); setLoading(false); return }
    router.push('/timeline')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-12">
          <Logo size={96} className="rounded-2xl mb-4" />
          <p className="text-muted text-sm tracking-wider">{t('tagline')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm text-muted mb-1.5">{t('email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-card border border-[#E8E0D8] rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent transition-colors"
              placeholder="film@example.com" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">{t('password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-card border border-[#E8E0D8] rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent transition-colors"
              placeholder="••••••••" />
          </div>
          {error && <p className="text-accent text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-accent text-white rounded-lg py-3 font-medium hover:bg-[#C05530] transition-colors disabled:opacity-60">
            {loading ? t('logging_in') : t('login')}
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-8">
          {t('no_account')}{' '}
          <Link href="/auth/register" className="text-accent hover:underline">{t('register_link')}</Link>
        </p>
      </div>
    </div>
  )
}
