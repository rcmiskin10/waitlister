import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Plus, Settings, CreditCard, ArrowRight } from 'lucide-react'
import { isSupabaseConfigured, createClient } from '@/lib/supabase/server'
import { entityConfig } from '@/config/entity'
import { siteConfig } from '@/config/site'

async function getStats(userId: string) {
  if (!isSupabaseConfigured()) {
    return { entityCount: 0 }
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from(entityConfig.slug)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    entityCount: count || 0,
  }
}

async function getCurrentUserSafe() {
  if (!isSupabaseConfigured()) {
    return null
  }

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export default async function DashboardPage() {
  const user = await getCurrentUserSafe()
  const stats = user ? await getStats(user.id) : { entityCount: 0 }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to {siteConfig.name}. Here&apos;s an overview of your activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{entityConfig.pluralName}</CardTitle>
            <entityConfig.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.entityCount}</div>
            <p className="text-xs text-muted-foreground">
              Total {entityConfig.pluralName.toLowerCase()} created
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with these common tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link
              href="/dashboard/entities/new"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <div className="bg-primary/10 p-2 rounded-lg">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">Create {entityConfig.name}</div>
                <div className="text-sm text-muted-foreground">
                  Add a new {entityConfig.name.toLowerCase()}
                </div>
              </div>
            </Link>
            <Link
              href="/dashboard/entities"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <div className="bg-primary/10 p-2 rounded-lg">
                <LayoutDashboard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">View {entityConfig.pluralName}</div>
                <div className="text-sm text-muted-foreground">
                  Browse all your {entityConfig.pluralName.toLowerCase()}
                </div>
              </div>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <div className="bg-primary/10 p-2 rounded-lg">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">Settings</div>
                <div className="text-sm text-muted-foreground">
                  Manage your account preferences
                </div>
              </div>
            </Link>
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <div className="bg-primary/10 p-2 rounded-lg">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">Billing</div>
                <div className="text-sm text-muted-foreground">
                  Manage your subscription and payments
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Set up your {siteConfig.name} account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">1</div>
                <span className="text-sm">Create your first {entityConfig.name.toLowerCase()}</span>
              </div>
              <Link href="/dashboard/entities/new">
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">2</div>
                <span className="text-sm">Set up billing</span>
              </div>
              <Link href="/dashboard/billing">
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">3</div>
                <span className="text-sm">Configure settings</span>
              </div>
              <Link href="/dashboard/settings">
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
