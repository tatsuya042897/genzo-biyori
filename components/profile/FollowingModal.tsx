'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import FollowButton from './FollowButton'

type FollowedUser = {
  id: string
  username: string
  bio: string | null
  avatar_url: string | null
}

type Props = {
  userId: string
  count: number
  currentUserId: string
}

export default function FollowingModal({ userId, count, currentUserId }: Props) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<FollowedUser[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleOpen() {
    setOpen(true)
    if (loaded) return
    setLoading(true)

    const supabase = createClient()
    const { data: followData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)

    const ids = (followData ?? []).map(f => f.following_id)

    if (ids.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, username, bio, avatar_url')
        .in('id', ids)
      setUsers(usersData ?? [])
    }

    setLoading(false)
    setLoaded(true)
  }

  const modal = open ? (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50"
      style={{ backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
    >
      <div className="w-full max-w-lg bg-[#F5EFE8] rounded-t-3xl shadow-2xl flex flex-col" style={{ maxHeight: '75vh' }}>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-[#D4C9BE] rounded-full" />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E0D8] flex-shrink-0">
          <h2 className="font-mincho text-base text-primary">フォロー中 {count > 0 && `(${count})`}</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-muted hover:text-primary transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-2">
          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loading && users.length === 0 && (
            <p className="text-center text-muted text-sm py-10">フォロー中のユーザーがいません</p>
          )}
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-3 py-3 border-b border-[#E8E0D8]/50 last:border-0">
              <Link
                href={`/profile/${u.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                {u.avatar_url ? (
                  <Image
                    src={u.avatar_url}
                    alt={u.username}
                    width={44}
                    height={44}
                    className="rounded-full w-11 h-11 object-cover flex-shrink-0"
                  />
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
              {u.id !== currentUserId && (
                <FollowButton
                  targetUserId={u.id}
                  currentUserId={currentUserId}
                  initialFollowing={true}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-left hover:opacity-70 transition-opacity"
      >
        <span className="font-playfair text-2xl text-primary">{count}</span>
        <span className="text-xs text-muted ml-1.5">フォロー</span>
      </button>

      {mounted && createPortal(modal, document.body)}
    </>
  )
}
