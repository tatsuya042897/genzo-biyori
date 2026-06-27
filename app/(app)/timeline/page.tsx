import { createClient } from '@/lib/supabase-server'
import PostCard from '@/components/post/PostCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PostWithUser = {
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

export default async function TimelinePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rawPosts } = await supabase
    .from('posts')
    .select(`
      id,
      image_url,
      film_name,
      camera,
      lens,
      created_at,
      users (
        id,
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: myReposts } = user
    ? await supabase.from('reposts').select('post_id').eq('user_id', user.id)
    : { data: [] }

  const repostedIds = new Set((myReposts ?? []).map((r) => r.post_id))

  const posts: PostWithUser[] = ((rawPosts ?? []) as unknown as PostWithUser[]).map((post) => ({
    ...post,
    users: Array.isArray(post.users) ? post.users[0] : post.users,
    reposted: repostedIds.has(post.id),
  }))

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-4 py-4 text-center border-b border-[#E8E0D8]/60">
        <h1 className="font-playfair text-2xl font-medium text-primary">現像日和</h1>
      </header>

      <main className="pt-4">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <p className="font-playfair text-6xl text-[#E8E0D8] mb-6">✦</p>
            <p className="text-muted text-sm leading-relaxed">まだ投稿がありません。<br />最初の一枚を共有しましょう。</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user?.id ?? ''} />
          ))
        )}
      </main>
    </div>
  )
}
