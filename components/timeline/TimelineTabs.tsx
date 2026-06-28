'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase-browser'
import PostCard from '@/components/post/PostCard'

type Post = {
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
  reposted: boolean
}

type Tab = 'following' | 'all'

export default function TimelineTabs({ currentUserId }: { currentUserId: string }) {
  const [tab, setTab] = useState<Tab>('all')
  const [followingPosts, setFollowingPosts] = useState<Post[]>([])
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [followingLoaded, setFollowingLoaded] = useState(false)
  const t = useTranslations('timeline')

  const fetchRepostedIds = useCallback(async (supabase: ReturnType<typeof createClient>) => {
    if (!currentUserId) return new Set<string>()
    const { data } = await supabase.from('reposts').select('post_id').eq('user_id', currentUserId)
    return new Set((data ?? []).map(r => r.post_id))
  }, [currentUserId])

  const normalizePosts = useCallback((raw: unknown[], repostedIds: Set<string>): Post[] => {
    return (raw as Post[]).map(p => ({
      ...p,
      users: Array.isArray(p.users) ? p.users[0] : p.users,
      reposted: repostedIds.has(p.id),
    }))
  }, [])

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      const supabase = createClient()
      const [{ data: rawPosts }, repostedIds] = await Promise.all([
        supabase
          .from('posts')
          .select('id, image_url, film_name, camera, lens, created_at, users(id, username, avatar_url)')
          .order('created_at', { ascending: false })
          .limit(50),
        fetchRepostedIds(supabase),
      ])
      setAllPosts(normalizePosts(rawPosts ?? [], repostedIds))
      setLoading(false)
    }
    fetchAll()
  }, [fetchRepostedIds, normalizePosts])

  useEffect(() => {
    if (tab !== 'following' || followingLoaded) return

    async function fetchFollowing() {
      setLoading(true)
      const supabase = createClient()

      const { data: followData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)

      const ids = (followData ?? []).map(f => f.following_id)

      if (ids.length === 0) {
        setFollowingPosts([])
        setFollowingLoaded(true)
        setLoading(false)
        return
      }

      const [{ data: rawPosts }, repostedIds] = await Promise.all([
        supabase
          .from('posts')
          .select('id, image_url, film_name, camera, lens, created_at, users(id, username, avatar_url)')
          .in('user_id', ids)
          .order('created_at', { ascending: false })
          .limit(50),
        fetchRepostedIds(supabase),
      ])

      setFollowingPosts(normalizePosts(rawPosts ?? [], repostedIds))
      setFollowingLoaded(true)
      setLoading(false)
    }

    fetchFollowing()
  }, [tab, followingLoaded, currentUserId, fetchRepostedIds, normalizePosts])

  const posts = tab === 'following' ? followingPosts : allPosts

  return (
    <>
      <div className="sticky top-[61px] bg-background/95 backdrop-blur-sm z-30 border-b border-[#E8E0D8]/60">
        <div className="max-w-lg mx-auto flex">
          <button
            onClick={() => setTab('following')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${tab === 'following' ? 'text-primary' : 'text-muted'}`}
          >
            {t('following_tab')}
            {tab === 'following' && <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-accent rounded-full" />}
          </button>
          <button
            onClick={() => setTab('all')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${tab === 'all' ? 'text-primary' : 'text-muted'}`}
          >
            {t('everyone_tab')}
            {tab === 'all' && <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-accent rounded-full" />}
          </button>
        </div>
      </div>

      <main className="pt-4">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <p className="font-playfair text-6xl text-[#E8E0D8] mb-6">✦</p>
            <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
              {tab === 'following' ? t('empty_following') : t('empty_all')}
            </p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))
        )}
      </main>
    </>
  )
}
