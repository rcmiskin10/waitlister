export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { getCurrentUser, getUserProfile, isSupabaseConfigured } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Dev mode: Allow access without auth when Supabase is not configured
  const supabaseConfigured = isSupabaseConfigured()

  let sidebarUser = {
    email: 'dev@example.com',
    name: 'Dev User',
    avatar: undefined as string | undefined,
  }

  if (supabaseConfigured) {
    const user = await getCurrentUser()

    if (!user) {
      redirect('/login')
    }

    const profile = await getUserProfile(user.id)

    sidebarUser = {
      email: user.email || '',
      name: profile?.full_name || user.user_metadata?.full_name || undefined,
      avatar: profile?.avatar_url || user.user_metadata?.avatar_url || undefined,
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          {!supabaseConfigured && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
              Dev Mode - Auth Disabled
            </span>
          )}
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
