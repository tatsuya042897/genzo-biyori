'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase-browser'
import FollowButton from '@/components/profile/FollowButton'
import { formatDistanceToNow } from 'date-fns'
import { ja, enUS, zhCN } from 'date-fns/locale'

type UserResult = {
  id: string
  username: string
  bio: string | null
  avatar_url: string | null
  isFollowing: boolean
}

type PostResult = {
  id: string
  image_url: string
  film_name: string | null
  camera: string | null
  lens: string | null
  created_at: string
  users: {
    id: string
    username: string
    avatar_url: string | null
  }
}

const dateFnsLocales = { ja, en: enUS, zh: zhCN }

export default function SearchPage() {
  const [tab, setTab] = useState<'user' | 'post'>('user')
  const [query, setQuery] = useState('')
  const [userResults, setUserResults] = useState<UserResult[]>([])
  const [postResults, setPostResults] = useState<PostResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const t = useTranslations('search')
  const locale = useLocale() as 'ja' | 'en' | 'zh'
  const dateLocale = dateFnsLocales[locale] ?? ja

  const handleSearch = useCallback(async (q: string, currentTab: 'user' | 'post') => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)

    if (currentTab === 'user') {
      const { data } = await supabase
        .from('users')
        .select('id, username, bio, avatar_url')
        .ilike('username', `%${q}%`)
        .limit(30)

      if (data && user) {
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)

        const followingIds = new Set((follows ?? []).map(f => f.following_id))
        setUserResults(data.map(u => ({ ...u, isFollowing: followingIds.has(u.id) })))
      } else {
        setUserResults((data ?? []).map(u => ({ ...u, isFollowing: false })))
      }
    } else {
      const { data } = await supabase
        .from('posts')
        .select('id, image_url, film_name, camera, lens, created_at, users ( id, username, avatar_url )')
        .or(`film_name.ilike.%${q}%,camera.ilike.%${q}%,lens.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(30)

      const posts = ((data ?? []) as unknown as PostResult[]).map(p => ({
        ...p,
        users: Array.isArray(p.users) ? p.users[0] : p.users,
      }))
      setPostResults(posts)
    }

    setLoading(false)
  }, [])

  function handleTabChange(newTab: 'user' | 'post') {
    setTab(newTab)
    setSearched(false)
    setQuery('')
    setUserResults([])
    setPostResults([])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleSearch(query, tab)
  }

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-4 pt-4 pb-2 border-b border-[#E8E0D8]/60">
        <h1 className="font-mincho text-lg text-center mb-3">{t('title')}</h1>

        <div className="flex gap-0 mb-3 bg-[#EDE7DF] rounded-lg p-0.5">
          <button
            onClick={() => handleTabChange('user')}
            className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${tab === 'user' ? 'bg-card text-primary shadow-sm' : 'text-muted'}`}
          >
            {t('tab_users')}
          </button>
          <button
            onClick={() => handleTabChange('post')}
            className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${tab === 'post' ? 'bg-card text-primary shadow-sm' : 'text-muted'}`}
          >
            {t('tab_posts')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={tab === 'user' ? t('placeholder_users') : t('placeholder_posts')}
            className="flex-1 bg-card border border-[#E8E0D8] rounded-lg px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-accent text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#C05530] transition-colors disabled:opacity-50"
          >
            {t('button')}
          </button>
        </form>
      </header>

      <main className="p-4">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && searched && tab === 'user' && (
          userResults.length === 0 ? (
            <p className="text-center text-muted text-sm py-16">{t('empty_users')}</p>
          ) : (
            <div className="space-y-3">
              {userResults.map(u => (
                <div key={u.id} className="bg-card rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <Link href={`/profile/${u.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    {u.avatar_url ? (
                      <Image src={u.avatar_url} alt={u.username} width={44} height={44} className="rounded-full w-11 h-11 object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#E8E0D8] flex items-center justify-center flex-shrink-0">
                        <span className="text-muted text-sm">{u.username[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-primary text-sm truncate">{u.username}</p>
                      {u.bio && <p className="text-muted text-xs truncate mt-0.5">{u.bio}</p>}
                    </div>
                  </Link>
                  {currentUserId && u.id !== currentUserId && (
                    <FollowButton targetUserId={u.id} currentUserId={currentUserId} initialFollowing={u.isFollowing} />
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {!loading && searched && tab === 'post' && (
          postResults.length === 0 ? (
            <p className="text-center text-muted text-sm py-16">{t('empty_posts')}</p>
          ) : (
            <div className="space-y-3">
              {postResults.map(post => (
                <div key={post.id} className="bg-card rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex gap-3 p-3">
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                      <Image src={post.image_url} alt="" fill className="object-cover" sizes="80px" />
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <Link href={`/profile/${post.users?.id}`} className="flex items-center gap-1.5 mb-2">
                        {post.users?.avatar_url ? (
                          <Image src={post.users.avatar_url} alt={post.users.username} width={20} height={20} className="rounded-full w-5 h-5 object-cover" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#E8E0D8] flex items-center justify-center">
                            <span className="text-muted text-[10px]">{post.users?.username[0]?.toUpperCase()}</span>
                          </div>
                        )}
                        <span className="text-xs text-primary font-medium truncate">{post.users?.username}</span>
                        <span className="text-xs text-muted ml-auto flex-shrink-0">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateLocale })}
                        </span>
                      </Link>
                      <div className="space-y-0.5">
                        {post.film_name && <p className="text-xs text-muted"><span className="text-[#A89990] mr-1">Film</span>{post.film_name}</p>}
                        {post.camera && <p className="text-xs text-muted"><span className="text-[#A89990] mr-1">Camera</span>{post.camera}</p>}
                        {post.lens && <p className="text-xs text-muted"><span className="text-[#A89990] mr-1">Lens</span>{post.lens}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {!searched && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-playfair text-5xl text-[#E8E0D8] mb-4">✦</p>
            <p className="text-muted text-sm">
              {tab === 'user' ? t('hint_users') : t('hint_posts')}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
