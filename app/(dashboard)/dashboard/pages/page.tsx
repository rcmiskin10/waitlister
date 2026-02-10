import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, ExternalLink, Settings } from 'lucide-react'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

interface LandingPage {
  id: string
  name: string
  slug: string | null
  is_published: boolean
}

async function getLandingPages(userId: string): Promise<LandingPage[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false }) as { data: LandingPage[] | null }

  return data || []
}

export default async function PagesPage() {
  const user = await getCurrentUser()
  const pages = user ? await getLandingPages(user.id) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Landing Pages</h1>
          <p className="text-muted-foreground">
            Manage your generated landing pages.
          </p>
        </div>
        <Link href="/dashboard/generator">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </Link>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No landing pages yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first AI-generated landing page.
            </p>
            <Link href="/dashboard/generator">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Landing Page
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Card key={page.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{page.name}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      page.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {page.is_published ? 'Published' : 'Draft'}
                  </span>
                </CardTitle>
                <CardDescription>
                  {page.slug ? `/${page.slug}` : 'No slug set'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link href={`/dashboard/pages/${page.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  {page.is_published && page.slug && (
                    <Link href={`/p/${page.slug}`} target="_blank">
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
