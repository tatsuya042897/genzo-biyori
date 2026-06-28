import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import CalendarView from '@/components/profile/CalendarView'
import FollowButton from '@/components/profile/FollowButton'
import ShareModal from '@/components/profile/ShareModal'
import SocialLinks from '@/components/profile/SocialLinks'
import { getTranslations } from 'next-intl/server'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const [session, supabase] = [await getSession(), createClient()]
  const currentUser = session?.user

  const [profileResult, postsResult, followCountResult, isFollowingResult, t] = await Promise.all([
    supabase.from('users').select('*').eq('id', params.userId).single(),
    supabase.from('posts').select('id, image_url, created_at').eq('user_id', params.userId).order('created_at', { ascending: false }),
    supabase.from('follows').select('following_id', { count: 'exact' }).eq('follower_id', params.userId),
    currentUser
      ? supabase.from('follows').select('follower_id').eq('follower_id', currentUser.id).eq('following_id', params.userId).maybeSingle()
      : Promise.resolve({ data: null }),
    getTranslations('profile'),
  ])

  const profile = profileResult.data
  if (!profile) notFound()

  const posts = postsResult.data ?? []
  const followingCount = followCountResult.count ?? 0
  const isFollowing = !!isFollowingResult.data
  const isOwnProfile = currentUser?.id === params.userId

  const postedDates = posts.map((p) => p.created_at)

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-4 py-4 border-b border-[#E8E0D8]/60">
        <div className="flex items-center justify-between">
          <div className="w-12" />
          <h1 className="font-mincho text-lg">{profile.username}</h1>
          <div className="w-12 flex justify-end">
            <ShareModal userId={params.userId} username={profile.username} />
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.username} width={72} height={72} className="rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-[#E8E0D8] flex items-center justify-center flex-shrink-0">
              <span className="text-muted text-2xl">{profile.username[0]?.toUpperCase()}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-mincho text-xl text-primary mb-1">{profile.username}</h2>
            {profile.bio && <p className="text-sm text-muted leading-relaxed">{profile.bio}</p>}
            <SocialLinks instagramUsername={profile.instagram_username ?? null} twitterUsername={profile.twitter_username ?? null} />
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-6">
            <div>
              <span className="font-playfair text-2xl text-primary">{posts.length}</span>
              <span className="text-xs text-muted ml-1.5">{t('posts')}</span>
            </div>
            {isOwnProfile && (
              <div>
                <span className="font-playfair text-2xl text-primary">{followingCount}</span>
                <span className="text-xs text-muted ml-1.5">{t('following')}</span>
              </div>
            )}
          </div>

          {!isOwnProfile && currentUser && (
            <FollowButton targetUserId={params.userId} currentUserId={currentUser.id} initialFollowing={isFollowing} />
          )}
        </div>

        <div className="mb-8">
          <h3 className="font-mincho text-sm text-muted mb-3">{t('calendar')}</h3>
          <CalendarView postedDates={postedDates} />
        </div>

        <div>
          <h3 className="font-mincho text-sm text-muted mb-3">{t('posts')}</h3>
          {posts.length === 0 ? (
            <p className="text-center text-muted text-sm py-12">{t('no_posts')}</p>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map((post) => (
                <div key={post.id} className="relative aspect-square">
                  <Image src={post.image_url} alt="" fill className="object-cover" sizes="(max-width: 512px) 33vw, 170px" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
