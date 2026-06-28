'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { createClient } from '@/lib/supabase-browser'

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
  reposted?: boolean
  commentCount?: number
}

export default function PostCard({ post, currentUserId }: { post: Post; currentUserId: string }) {
  const [reposted, setReposted] = useState(post.reposted ?? false)
  const [loading, setLoading] = useState(false)

  async function handleRepost() {
    if (loading) return
    setLoading(true)
    const supabase = createClient()

    if (reposted) {
      await supabase.from('reposts').delete().eq('user_id', currentUserId).eq('post_id', post.id)
      setReposted(false)
    } else {
      await supabase.from('reposts').insert({ user_id: currentUserId, post_id: post.id })
      setReposted(true)

      // リポスト通知（自分の投稿は除く）
      if (currentUserId && currentUserId !== post.users.id) {
        await supabase.from('notifications').insert({
          user_id: post.users.id,
          actor_id: currentUserId,
          type: 'repost',
          post_id: post.id,
        })
      }
    }
    setLoading(false)
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ja })

  return (
    <article className="bg-card mb-4 mx-4 rounded-2xl overflow-hidden shadow-sm">
      <Link href={`/post/${post.id}`}>
        <div className="relative aspect-square w-full">
          <Image
            src={post.image_url}
            alt={`${post.users.username}の写真`}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
          />
        </div>
      </Link>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <Link href={`/profile/${post.users.id}`} className="flex items-center gap-2">
            {post.users.avatar_url ? (
              <Image
                src={post.users.avatar_url}
                alt={post.users.username}
                width={32}
                height={32}
                className="rounded-full w-8 h-8 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#E8E0D8] flex items-center justify-center">
                <span className="text-muted text-xs">{post.users.username[0]?.toUpperCase()}</span>
              </div>
            )}
            <span className="text-sm font-medium text-primary">{post.users.username}</span>
          </Link>
          <span className="text-xs text-muted">{timeAgo}</span>
        </div>

        {(post.film_name || post.camera || post.lens) && (
          <div className="space-y-0.5 mb-3">
            {post.film_name && (
              <p className="text-xs text-muted">
                <span className="text-[#A89990] mr-1">Film</span>{post.film_name}
              </p>
            )}
            {post.camera && (
              <p className="text-xs text-muted">
                <span className="text-[#A89990] mr-1">Camera</span>{post.camera}
              </p>
            )}
            {post.lens && (
              <p className="text-xs text-muted">
                <span className="text-[#A89990] mr-1">Lens</span>{post.lens}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 justify-end">
          <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 text-muted hover:text-primary transition-colors">
            <CommentIcon />
            {post.commentCount != null && post.commentCount > 0 && (
              <span className="text-xs">{post.commentCount}</span>
            )}
          </Link>
          <button
            onClick={handleRepost}
            disabled={loading}
            className={`flex items-center gap-1.5 text-sm transition-colors ${reposted ? 'text-accent' : 'text-muted hover:text-primary'}`}
            title={reposted ? 'リポスト済み' : 'リポスト'}
          >
            <RepostIcon />
          </button>
        </div>
      </div>
    </article>
  )
}

function CommentIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

function RepostIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  )
}
