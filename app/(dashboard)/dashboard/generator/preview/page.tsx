'use client'

import { useEffect, useState } from 'react'
import { LandingPageRenderer } from '@/components/landing/LandingPageRenderer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Smartphone, Monitor, Tablet } from 'lucide-react'
import Link from 'next/link'
import type { LandingPageStructure } from '@/types/agents'

type ViewMode = 'desktop' | 'tablet' | 'mobile'

export default function PreviewPage() {
  const [landingPage, setLandingPage] = useState<LandingPageStructure | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')

  useEffect(() => {
    // Get landing page data from sessionStorage (set by generator page)
    const stored = sessionStorage.getItem('previewLandingPage')
    if (stored) {
      try {
        setLandingPage(JSON.parse(stored))
      } catch {
        // Invalid JSON
      }
    }
  }, [])

  const getContainerClass = () => {
    switch (viewMode) {
      case 'mobile':
        return 'w-[375px]'
      case 'tablet':
        return 'w-[768px]'
      default:
        return 'w-full'
    }
  }

  if (!landingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">No landing page to preview.</p>
          <Link href="/dashboard/generator">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Generator
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      {/* Toolbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-800 border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <Link href="/dashboard/generator">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Editor
            </Button>
          </Link>

          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1">
            <Button
              variant={viewMode === 'desktop' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('desktop')}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              Desktop
            </Button>
            <Button
              variant={viewMode === 'tablet' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('tablet')}
              className="gap-2"
            >
              <Tablet className="h-4 w-4" />
              Tablet
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('mobile')}
              className="gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Mobile
            </Button>
          </div>

          <div className="w-[120px]" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Preview Container */}
      <div className="pt-14 min-h-screen flex justify-center">
        <div className={`${getContainerClass()} bg-white dark:bg-slate-950 shadow-2xl transition-all duration-300`}>
          <LandingPageRenderer structure={landingPage} isPreview={true} />
        </div>
      </div>
    </div>
  )
}
