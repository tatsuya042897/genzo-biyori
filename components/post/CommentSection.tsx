'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { createClient } from '@/lib/supabase-browser'

type CommentUser = { id: string; username: string; avatar_url: string | null }

type Comment = {
  id: string
  content: string
  created_at: string
  users: CommentUser
}

type Props = {
  postId: string
  postOwnerId: string
  currentUserId: string
  currentUserProfile: CommentUser | null
  initialComments: Comment[]
}

export default function CommentSection({ postId, postOwnerId, currentUserId, currentUserProfile, initialComments }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [text])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || submitting || !currentUserId || !currentUserProfile) return
    setSubmitting(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: currentUserId, content: text.trim() })
      .select('id, created_at')
      .single()

    if (!error && data) {
      const newComment: Comment = {
        id: data.id,
        content: text.trim(),
        created_at: data.created_at,
        users: currentUserProfile,
      }
      setComments(prev => [...prev, newComment])
      setText('')

      // コメント通知（自分の投稿は除く）
      if (currentUserId !== postOwnerId) {
        await supabase.from('notifications').insert({
          user_id: postOwnerId,
          actor_id: currentUserId,
          type: 'comment',
          post_id: postId,
          comment_id: data.id,
        })
      }
    }
    setSubmitting(false)
  }

  async function handleDelete(commentId: string) {
    const supabase = createClient()
    await supabase.from('comments').delete().eq('id', commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  return (
    <div>
      <h2 className="font-mincho text-sm text-muted mb-4">
        コメント {comments.length > 0 && `(${comments.length})`}
      </h2>

      {comments.length === 0 && (
        <p className="text-center text-muted text-sm py-6">まだコメントがありません</p>
      )}

      <div className="space-y-4 mb-6">
        {comments.map(c => (
          <div key={c.id} className="flex gap-3">
            <Link href={`/profile/${c.users.id}`} className="flex-shrink-0">
              {c.users.avatar_url ? (
                <Image src={c.users.avatar_url} alt={c.users.username} width={32} height={32} className="rounded-full w-8 h-8 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#E8E0D8] flex items-center justify-center">
                  <span className="text-muted text-xs">{c.users.username[0]?.toUpperCase()}</span>
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <Link href={`/profile/${c.users.id}`} className="text-xs font-medium text-primary hover:underline">
                  {c.users.username}
                </Link>
                <span className="text-[10px] text-muted">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ja })}
                </span>
                {c.users.id === currentUserId && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-[10px] text-muted hover:text-accent ml-auto transition-colors"
                  >
                    削除
                  </button>
                )}
              </div>
              <p className="text-sm text-primary mt-0.5 leading-relaxed whitespace-pre-wrap">{c.content}</p>
            </div>
          </div>
        ))}
      </div>

      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="コメントを追加..."
            maxLength={500}
            rows={1}
            className="flex-1 bg-background border border-[#E8E0D8] rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent transition-colors resize-none overflow-hidden"
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="flex-shrink-0 bg-accent text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#C05530] transition-colors disabled:opacity-50"
          >
            投稿
          </button>
        </form>
      )}
    </div>
  )
}
