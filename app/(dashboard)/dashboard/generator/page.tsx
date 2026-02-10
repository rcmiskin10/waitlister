'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { LandingPageEditor } from '@/components/editor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Wand2, Pencil, Save, Globe, ExternalLink, Loader2, RefreshCw, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { Message } from '@/hooks/use-session'
import type { LandingPageStructure } from '@/types/agents'
import {
  extractAIAction,
  actionToLandingPage,
  applyPatches,
} from '@/lib/utils/message-parser'

// Auto-save storage key
const AUTOSAVE_KEY = 'saasify_landing_page_autosave'

function getAutoSavedPage(): LandingPageStructure | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function setAutoSavedPage(page: LandingPageStructure | null): void {
  if (typeof window === 'undefined') return
  try {
    if (page) {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(page))
    } else {
      localStorage.removeItem(AUTOSAVE_KEY)
    }
  } catch {
    // Storage full or unavailable
  }
}

export default function GeneratorPage() {
  const [landingPage, setLandingPage] = useState<LandingPageStructure | null>(null)
  const [activeTab, setActiveTab] = useState<string>('generate')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [pageName, setPageName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [savedPageId, setSavedPageId] = useState<string | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load auto-saved page on mount
  useEffect(() => {
    const savedPage = getAutoSavedPage()
    if (savedPage) {
      setLandingPage(savedPage)
      setActiveTab('edit')
      toast.info('Restored your previous work')
    }
  }, [])

  // Auto-save when landing page changes
  useEffect(() => {
    if (!landingPage) return

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    setAutoSaveStatus('saving')

    // Debounce auto-save by 1 second
    autoSaveTimeoutRef.current = setTimeout(() => {
      setAutoSavedPage(landingPage)
      setAutoSaveStatus('saved')

      // Reset to idle after 2 seconds
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    }, 1000)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [landingPage])

  const handleMessage = useCallback((message: Message) => {
    if (message.role === 'assistant') {
      console.log('[Generator] Received message:', message.content.substring(0, 200))

      const action = extractAIAction(message.content)
      console.log('[Generator] Extracted action:', action)

      if (!action) {
        // No JSON detected - the AI might have just described changes
        // Check if the message mentions changes but has no JSON
        const mentionsChanges = /\b(change|update|patch|modify|replace)\b/i.test(message.content)
        const hasExistingPage = !!landingPage
        console.log('[Generator] No action found. Mentions changes:', mentionsChanges, 'Has page:', hasExistingPage)
        if (mentionsChanges && hasExistingPage && !message.content.includes('```json')) {
          toast.info('Ask the AI to "apply the changes" to update your page.')
        }
        return
      }

      if (action.action === 'generate') {
        // Full page generation
        const structure = actionToLandingPage(action)
        console.log('[Generator] Generate action, structure:', !!structure)
        if (structure && structure.sections && structure.sections.length > 0) {
          setLandingPage(structure)
          setActiveTab('edit')
          toast.success('Landing page generated! Switching to editor.')
        }
      } else if (action.action === 'patch' && action.changes && landingPage) {
        // Apply patches to existing page
        console.log('[Generator] Applying patches:', action.changes)
        const updated = applyPatches(landingPage, action.changes)
        setLandingPage(updated)
        // Switch to edit tab so user can see the changes
        setActiveTab('edit')
        toast.success(`Applied ${action.changes.length} change(s) to your landing page!`)
      } else {
        console.log('[Generator] Action not handled:', action.action, 'Has changes:', !!action.changes, 'Has page:', !!landingPage)
      }
    }
  }, [landingPage])

  const handleEditorChange = useCallback((structure: LandingPageStructure) => {
    setLandingPage(structure)
    // Reset saved state when content changes
    if (savedPageId) {
      setSavedPageId(null)
    }
  }, [savedPageId])

  const handleSave = async () => {
    if (!landingPage || !pageName.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pageName.trim(),
          content: landingPage,
          theme: landingPage.theme,
          metadata: landingPage.metadata,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save landing page')
      }

      const { page } = await response.json()
      setSavedPageId(page.id)
      setShowSaveDialog(false)
      // Clear auto-save after successful save
      setAutoSavedPage(null)
      toast.success('Landing page saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save landing page')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!savedPageId) {
      toast.error('Please save the landing page first')
      return
    }

    setIsPublishing(true)
    try {
      const response = await fetch(`/api/landing-pages/${savedPageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish landing page')
      }

      toast.success('Landing page published! It will now appear on the homepage.')
    } catch (error) {
      console.error('Publish error:', error)
      toast.error('Failed to publish landing page')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleRegenerate = () => {
    setActiveTab('generate')
    toast.info('Describe your product again to generate a new landing page')
  }

  const handleClear = () => {
    setLandingPage(null)
    setSavedPageId(null)
    setAutoSavedPage(null)
    setActiveTab('generate')
    toast.info('Cleared landing page')
  }

  const openFullPreview = () => {
    if (landingPage) {
      sessionStorage.setItem('previewLandingPage', JSON.stringify(landingPage))
      window.open('/dashboard/generator/preview', '_blank')
    }
  }

  return (
    <div className="space-y-4 h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Landing Page Generator</h1>
          <p className="text-muted-foreground">
            Create stunning landing pages with AI assistance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Auto-save indicator */}
          {landingPage && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
              {autoSaveStatus === 'saving' && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Auto-saved</span>
                </>
              )}
            </div>
          )}

          {landingPage && (
            <>
              <Button
                variant="outline"
                onClick={handleRegenerate}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
              <Button
                variant="outline"
                onClick={openFullPreview}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Full Preview
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(true)}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              {savedPageId && (
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  {isPublishing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  Publish
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="generate" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Generate with AI
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-2" disabled={!landingPage}>
            <Pencil className="h-4 w-4" />
            Visual Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="flex-1 mt-4">
          <div className="grid lg:grid-cols-3 gap-6 h-full">
            {/* Chat Panel */}
            <Card className="lg:col-span-2 h-[calc(100vh-280px)] min-h-[500px] flex flex-col overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-violet-600" />
                  AI Assistant
                </CardTitle>
                <CardDescription>
                  Describe your product and I&apos;ll generate a landing page.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
                <ChatInterface
                  agentType="landing-generator"
                  placeholder="Describe your SaaS product... e.g., 'A project management tool for remote teams with real-time collaboration'"
                  onMessage={handleMessage}
                  currentPage={landingPage || undefined}
                />
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
                <CardDescription>Get the best results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Be specific</h4>
                  <p className="text-sm text-muted-foreground">
                    Include your product name, target audience, and key features.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Set the tone</h4>
                  <p className="text-sm text-muted-foreground">
                    Specify if you want professional, casual, or playful copy.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Request styles</h4>
                  <p className="text-sm text-muted-foreground">
                    Ask for specific colors (ocean, sunset, forest) or styles (glassmorphic, minimal, bold).
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Iterate</h4>
                  <p className="text-sm text-muted-foreground">
                    Ask for revisions to specific sections until you&apos;re happy.
                  </p>
                </div>
                {landingPage && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClear}
                      className="w-full text-muted-foreground"
                    >
                      Clear &amp; Start Fresh
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="flex-1 mt-4 h-[calc(100vh-280px)]">
          {landingPage ? (
            <LandingPageEditor
              structure={landingPage}
              onChange={handleEditorChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No landing page generated yet.</p>
                <p className="text-sm mt-2">Use the &quot;Generate with AI&quot; tab to create one.</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Landing Page</DialogTitle>
            <DialogDescription>
              Give your landing page a name to save it for later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pageName">Page Name</Label>
              <Input
                id="pageName"
                placeholder="My Awesome Landing Page"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!pageName.trim() || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
