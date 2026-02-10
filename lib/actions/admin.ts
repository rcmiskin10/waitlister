'use server'

import { createClient, getCurrentUser } from '@/lib/supabase/server'

// Admin emails - in production, this would come from env or a DB flag
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean)

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user?.email) return false
  return ADMIN_EMAILS.includes(user.email)
}

export interface AdminUser {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  subscription_status: string | null
  subscription_tier: string | null
  created_at: string | null
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, subscription_status, subscription_tier, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin users:', error)
    return []
  }

  return (data as AdminUser[]) || []
}

export interface AdminStats {
  totalUsers: number
  activeSubscriptions: number
  paidUsers: number
  recentSignups: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: activeSubscriptions },
    { count: paidUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('subscription_tier', 'free')
      .not('subscription_tier', 'is', null),
  ])

  // Recent signups (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { count: recentSignups } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString())

  return {
    totalUsers: totalUsers || 0,
    activeSubscriptions: activeSubscriptions || 0,
    paidUsers: paidUsers || 0,
    recentSignups: recentSignups || 0,
  }
}
