import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import CalendarView from '@/components/profile/CalendarView'
import ShareModal from '@/components/profile/ShareModal'
import FollowingModal from '@/components/profile/FollowingModal'
import SocialLinks from '@/components/profile/SocialLinks'

export const dynamic = 'force-dynamic'

export default async function MyProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileResult, postsResult, followCountResult] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('posts').select('id, image_url, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('follows').select('following_id', { count: 'exact' }).eq('follower_id', user.id),
  ])

  const profile = profileResult.data
  const posts = postsResult.data ?? []
  const followingCount = followCountResult.count ?? 0

  if (!profile) redirect('/auth/login')

  const postedDates = posts.map((p) => p.created_at)

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-4 py-4 border-b border-[#E8E0D8]/60">
        <div className="flex items-center justify-between">
          <h1 className="font-mincho text-lg">プロフィール</h1>
          <div className="flex items-center gap-4">
            <ShareModal userId={profile.id} username={profile.username} />
            <Link href="/profile/edit" className="text-sm text-muted hover:text-primary transition-colors">
              編集
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={72}
              height={72}
              className="rounded-full w-18 h-18 object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-18 h-18 rounded-full bg-[#E8E0D8] flex items-center justify-center flex-shrink-0 w-[72px] h-[72px]">
              <span className="text-muted text-2xl">{profile.username[0]?.toUpperCase()}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-mincho text-xl text-primary mb-1">{profile.username}</h2>
            {profile.bio && (
              <p className="text-sm text-muted leading-relaxed">{profile.bio}</p>
            )}
            <SocialLinks
              instagramUsername={profile.instagram_username ?? null}
              twitterUsername={profile.twitter_username ?? null}
            />
          </div>
        </div>

        <div className="flex gap-6 mb-8">
          <div>
            <span className="font-playfair text-2xl text-primary">{posts.length}</span>
            <span className="text-xs text-muted ml-1.5">投稿</span>
          </div>
          <FollowingModal userId={profile.id} count={followingCount} currentUserId={profile.id} />
        </div>

        <div className="mb-8">
          <h3 className="font-mincho text-sm text-muted mb-3">投稿カレンダー</h3>
          <CalendarView postedDates={postedDates} />
        </div>

        <div>
          <h3 className="font-mincho text-sm text-muted mb-3">投稿</h3>
          {posts.length === 0 ? (
            <p className="text-center text-muted text-sm py-12">まだ投稿がありません</p>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map((post) => (
                <div key={post.id} className="relative aspect-square">
                  <Image
                    src={post.image_url}
                    alt="投稿画像"
                    fill
                    className="object-cover"
                    sizes="(max-width: 512px) 33vw, 170px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
