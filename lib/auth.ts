import { cache } from 'react'
import { createClient } from './supabase-server'

// React cache() deduplicates this call within the same render tree
// (layout + page both calling this only triggers ONE cookie read, not two)
export const getSession = cache(async () => {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
})
