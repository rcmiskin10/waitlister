import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { isAdmin, getAdminStats, getAdminUsers } from '@/lib/actions/admin'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { Users, CreditCard, TrendingUp, Activity, CheckCircle, XCircle } from 'lucide-react'

function StatusIndicator({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      {ok ? (
        <div className="flex items-center gap-1.5 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Connected</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-red-600">
          <XCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Not configured</span>
        </div>
      )}
    </div>
  )
}

export default async function AdminAnalyticsPage() {
  const admin = await isAdmin()
  if (!admin) redirect('/dashboard')

  const stats = await getAdminStats()
  const users = await getAdminUsers()

  // Service health checks
  const services = [
    { label: 'Supabase', ok: isSupabaseConfigured() },
    { label: 'Stripe', ok: !!process.env.STRIPE_SECRET_KEY },
    { label: 'Resend', ok: !!process.env.RESEND_API_KEY },
    { label: 'Anthropic (Claude)', ok: !!process.env.ANTHROPIC_API_KEY },
    { label: 'PostHog', ok: !!process.env.NEXT_PUBLIC_POSTHOG_KEY },
  ]

  // Calculate conversion
  const freeUsers = stats.totalUsers - stats.paidUsers
  const conversionRate =
    stats.totalUsers > 0
      ? ((stats.paidUsers / stats.totalUsers) * 100).toFixed(1)
      : '0'

  // Recent users (last 5)
  const recentUsers = users.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform metrics and system health.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentSignups}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown by subscription status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Free</Badge>
                <span className="text-sm text-muted-foreground">{freeUsers} users</span>
              </div>
              <span className="text-sm font-medium">
                {stats.totalUsers > 0 ? ((freeUsers / stats.totalUsers) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">Paid</Badge>
                <span className="text-sm text-muted-foreground">{stats.paidUsers} users</span>
              </div>
              <span className="text-sm font-medium">
                {stats.totalUsers > 0 ? ((stats.paidUsers / stats.totalUsers) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Service connection status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {services.map((svc) => (
              <StatusIndicator key={svc.label} ok={svc.ok} label={svc.label} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Signups */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Signups</CardTitle>
          <CardDescription>Last 5 users to join</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{user.full_name || user.email || 'Unknown'}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '--'}
                </span>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No users yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
