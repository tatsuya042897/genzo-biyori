'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Props = {
  targetUserId: string
  currentUserId: string
  initialFollowing: boolean
}

export default function FollowButton({ targetUserId, currentUserId, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (loading) return
    setLoading(true)
    const supabase = createClient()

    if (following) {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
      setFollowing(false)
    } else {
      await supabase.from('follows').insert({
        follower_id: currentUserId,
        following_id: targetUserId,
      })
      setFollowing(true)

      // フォロー通知
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        actor_id: currentUserId,
        type: 'follow',
      })
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-60 ${
        following
          ? 'bg-card border border-[#E8E0D8] text-muted hover:border-accent hover:text-accent'
          : 'bg-accent text-white hover:bg-[#C05530]'
      }`}
    >
      {following ? 'フォロー中' : 'フォローする'}
    </button>
  )
}
