export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          bio: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          username?: string
          bio?: string | null
          avatar_url?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          user_id: string
          image_url: string
          film_name: string | null
          camera: string | null
          lens: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          film_name?: string | null
          camera?: string | null
          lens?: string | null
          created_at?: string
        }
        Update: {
          film_name?: string | null
          camera?: string | null
          lens?: string | null
        }
        Relationships: []
      }
      reposts: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
