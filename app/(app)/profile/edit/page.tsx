'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'

export default function EditProfilePage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [instagramUsername, setInstagramUsername] = useState('')
  const [twitterUsername, setTwitterUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      supabase.from('users').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setUsername(data.username)
          setBio(data.bio ?? '')
          setAvatarUrl(data.avatar_url)
          setInstagramUsername(data.instagram_username ?? '')
          setTwitterUsername(data.twitter_username ?? '')
        }
      })
    })
  }, [router])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    let newAvatarUrl = avatarUrl

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${userId}/avatar.${ext}`, avatarFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(`${userId}/avatar.${ext}`)
        newAvatarUrl = data.publicUrl + `?t=${Date.now()}`
      }
    }

    const { error: updateError } = await supabase.from('users').update({
      username,
      bio: bio || null,
      avatar_url: newAvatarUrl,
      instagram_username: instagramUsername.replace('@', '').trim() || null,
      twitter_username: twitterUsername.replace('@', '').trim() || null,
    }).eq('id', userId)

    if (updateError) {
      setError('保存に失敗しました')
      setLoading(false)
      return
    }

    router.push('/profile')
    router.refresh()
  }

  const displayAvatar = avatarPreview || avatarUrl

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-4 py-4 border-b border-[#E8E0D8]/60">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-muted hover:text-primary transition-colors">
            キャンセル
          </button>
          <h1 className="font-mincho text-lg">プロフィール編集</h1>
          <div className="w-16" />
        </div>
      </header>

      <form onSubmit={handleSave} className="p-6 space-y-6">
        <div className="flex flex-col items-center">
          <label className="cursor-pointer">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-[#E8E0D8] flex items-center justify-center bg-card hover:border-accent transition-colors">
              {displayAvatar ? (
                <Image src={displayAvatar} alt="avatar" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted text-xs text-center">写真を<br />変更</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
          <p className="text-xs text-muted mt-2">タップして変更</p>
        </div>

        <div>
          <label className="block text-sm text-muted mb-1.5">ユーザー名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            maxLength={30}
            className="w-full bg-card border border-[#E8E0D8] rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1.5">自己紹介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={4}
            className="w-full bg-card border border-[#E8E0D8] rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted font-medium">SNSアカウント連携</p>

          <div>
            <label className="block text-sm text-muted mb-1.5 flex items-center gap-1.5">
              <InstagramIcon />
              Instagram
            </label>
            <div className="flex items-center bg-card border border-[#E8E0D8] rounded-lg overflow-hidden focus-within:border-accent transition-colors">
              <span className="px-3 text-muted text-sm">@</span>
              <input
                type="text"
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value.replace('@', ''))}
                placeholder="username"
                maxLength={50}
                className="flex-1 bg-transparent py-3 pr-4 text-primary focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5 flex items-center gap-1.5">
              <XIcon />
              X (Twitter)
            </label>
            <div className="flex items-center bg-card border border-[#E8E0D8] rounded-lg overflow-hidden focus-within:border-accent transition-colors">
              <span className="px-3 text-muted text-sm">@</span>
              <input
                type="text"
                value={twitterUsername}
                onChange={(e) => setTwitterUsername(e.target.value.replace('@', ''))}
                placeholder="username"
                maxLength={50}
                className="flex-1 bg-transparent py-3 pr-4 text-primary focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-accent text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !username}
          className="w-full bg-accent text-white rounded-lg py-3 font-medium hover:bg-[#C05530] transition-colors disabled:opacity-60"
        >
          {loading ? '保存中...' : '保存する'}
        </button>
      </form>
    </div>
  )
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
