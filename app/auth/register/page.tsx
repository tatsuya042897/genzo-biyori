'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase-browser'
import Logo from '@/components/layout/Logo'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'account' | 'profile'>('account')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const t = useTranslations('auth')

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) { setError(t('password_min_error')); return }
    setStep('profile')
  }

  async function handleProfileStep(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (authError || !authData.user) {
      setError(authError?.message || '登録に失敗しました')
      setLoading(false)
      return
    }

    if (authData.session) {
      await supabase.auth.setSession({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      })
    } else {
      setError('セッションの取得に失敗しました。メール確認設定を確認してください。')
      setLoading(false)
      return
    }

    const userId = authData.user.id
    let avatarUrl: string | null = null

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${userId}/avatar.${ext}`, avatarFile, { upsert: true })

      if (!uploadError) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(`${userId}/avatar.${ext}`)
        avatarUrl = data.publicUrl
      }
    }

    const { error: profileError } = await supabase.from('users').insert({
      id: userId, username, bio: bio || null, avatar_url: avatarUrl,
    })

    if (profileError) {
      setError('プロフィールの保存に失敗しました: ' + profileError.message)
      setLoading(false)
      return
    }

    router.push('/timeline')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <Logo size={96} className="rounded-2xl mb-4" />
          <p className="text-muted text-sm tracking-wider">
            {step === 'account' ? t('register_title') : t('profile_title')}
          </p>
        </div>

        {step === 'account' ? (
          <form onSubmit={handleAccountStep} className="space-y-5">
            <div>
              <label className="block text-sm text-muted mb-1.5">{t('email')}</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-card border border-[#E8E0D8] rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent transition-colors"
                placeholder="film@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">{t('password')}</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full bg-card border border-[#E8E0D8] rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent transition-colors"
                placeholder={t('password_hint')}
              />
            </div>
            {error && <p className="text-accent text-sm">{error}</p>}
            <button type="submit" className="w-full bg-accent text-white rounded-lg py-3 font-medium hover:bg-[#C05530] transition-colors">
              {t('next')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleProfileStep} className="space-y-5">
            <div className="flex flex-col items-center mb-4">
              <label className="cursor-pointer">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#E8E0D8] flex items-center justify-center overflow-hidden bg-card hover:border-accent transition-colors">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="avatar" width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted text-xs text-center leading-tight whitespace-pre-line">{t('avatar_label')}</span>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">{t('username')} <span className="text-accent">*</span></label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)} required maxLength={30}
                className="w-full bg-card border border-[#E8E0D8] rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent transition-colors"
                placeholder="filmlover"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">{t('bio')}</label>
              <textarea
                value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} rows={3}
                className="w-full bg-card border border-[#E8E0D8] rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="フィルムカメラが好きです..."
              />
            </div>
            {error && <p className="text-accent text-sm">{error}</p>}
            <button
              type="submit" disabled={loading || !username}
              className="w-full bg-accent text-white rounded-lg py-3 font-medium hover:bg-[#C05530] transition-colors disabled:opacity-60"
            >
              {loading ? t('submitting') : t('submit')}
            </button>
            <button
              type="button" onClick={() => setStep('account')}
              className="w-full text-muted text-sm hover:text-primary transition-colors"
            >
              {t('back')}
            </button>
          </form>
        )}

        {step === 'account' && (
          <p className="text-center text-muted text-sm mt-8">
            {t('have_account')}{' '}
            <Link href="/auth/login" className="text-accent hover:underline">{t('login_link')}</Link>
          </p>
        )}
      </div>
    </div>
  )
}
