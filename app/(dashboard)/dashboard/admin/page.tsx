import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, CreditCard, TrendingUp, ArrowRight } from 'lucide-react'
import { isAdmin, getAdminStats } from '@/lib/actions/admin'

export default async function AdminPage() {
  const admin = await isAdmin()
  if (!admin) redirect('/dashboard')

  const stats = await getAdminStats()

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: `${stats.recentSignups} new this week`,
      icon: Users,
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      description: `${stats.paidUsers} paid users`,
      icon: CreditCard,
    },
    {
      title: 'Paid Users',
      value: stats.paidUsers,
      description: 'Users on a paid plan',
      icon: TrendingUp,
    },
    {
      title: 'Recent Signups',
      value: stats.recentSignups,
      description: 'Last 7 days',
      icon: Users,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your platform metrics and user management.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage all platform users.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/users">
              <Button variant="outline">
                View All Users
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Detailed platform analytics and metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/analytics">
              <Button variant="outline">
                View Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
