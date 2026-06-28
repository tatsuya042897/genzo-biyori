import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja, enUS, zhCN } from 'date-fns/locale'
import { getTranslations, getLocale } from 'next-intl/server'
import CommentSection from '@/components/post/CommentSection'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type UserProfile = { id: string; username: string; avatar_url: string | null }
type Comment = { id: string; content: string; created_at: string; users: UserProfile }

const dateFnsLocales = { ja, en: enUS, zh: zhCN }

export default async function PostDetailPage({ params }: { params: { postId: string } }) {
  const [session, supabase] = [await getSession(), createClient()]
  const user = session?.user

  const { data: post } = await supabase
    .from('posts')
    .select('id, image_url, film_name, camera, lens, created_at, user_id')
    .eq('id', params.postId)
    .single()

  if (!post) notFound()

  const [postUserResult, commentsResult, currentProfileResult, t, locale] = await Promise.all([
    supabase.from('users').select('id, username, avatar_url').eq('id', post.user_id).single(),
    supabase.from('comments').select('id, content, created_at, user_id').eq('post_id', post.id).order('created_at', { ascending: true }),
    user ? supabase.from('users').select('id, username, avatar_url').eq('id', user.id).single() : Promise.resolve({ data: null }),
    getTranslations('post'),
    getLocale(),
  ])

  const postUser: UserProfile = postUserResult.data ?? { id: post.user_id, username: '?', avatar_url: null }

  const rawComments = commentsResult.data ?? []
  const commentUserIds = Array.from(new Set(rawComments.map(c => c.user_id)))
  const { data: commentUsersData } = commentUserIds.length > 0
    ? await supabase.from('users').select('id, username, avatar_url').in('id', commentUserIds)
    : { data: [] }

  const usersMap: Record<string, UserProfile> = {}
  for (const u of (commentUsersData ?? [])) usersMap[u.id] = u

  const comments: Comment[] = rawComments.map(c => ({
    id: c.id,
    content: c.content,
    created_at: c.created_at,
    users: usersMap[c.user_id] ?? { id: c.user_id, username: '?', avatar_url: null },
  }))

  const currentProfile = currentProfileResult.data ?? null
  const dateLocale = dateFnsLocales[locale as 'ja' | 'en' | 'zh'] ?? ja
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateLocale })

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-4 py-4 border-b border-[#E8E0D8]/60">
        <div className="flex items-center gap-3">
          <Link href="/timeline" className="text-muted hover:text-primary transition-colors p-1 -ml-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="font-mincho text-lg">{t('title')}</h1>
        </div>
      </header>

      <div>
        <div className="relative aspect-square w-full">
          <Image
            src={post.image_url}
            alt={`${postUser.username}`}
            fill className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
            priority
          />
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/profile/${postUser.id}`} className="flex items-center gap-2">
              {postUser.avatar_url ? (
                <Image src={postUser.avatar_url} alt={postUser.username} width={36} height={36} className="rounded-full w-9 h-9 object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#E8E0D8] flex items-center justify-center">
                  <span className="text-muted text-sm">{postUser.username[0]?.toUpperCase()}</span>
                </div>
              )}
              <span className="font-medium text-primary">{postUser.username}</span>
            </Link>
            <span className="text-xs text-muted">{timeAgo}</span>
          </div>

          {(post.film_name || post.camera || post.lens) && (
            <div className="bg-[#F0E9E2] rounded-xl p-3 mb-6 space-y-1">
              {post.film_name && <p className="text-xs text-muted"><span className="text-[#A89990] mr-2">Film</span>{post.film_name}</p>}
              {post.camera && <p className="text-xs text-muted"><span className="text-[#A89990] mr-2">Camera</span>{post.camera}</p>}
              {post.lens && <p className="text-xs text-muted"><span className="text-[#A89990] mr-2">Lens</span>{post.lens}</p>}
            </div>
          )}

          <CommentSection
            postId={post.id}
            postOwnerId={postUser.id}
            currentUserId={user?.id ?? ''}
            currentUserProfile={currentProfile}
            initialComments={comments}
          />
        </div>
      </div>
    </div>
  )
}
