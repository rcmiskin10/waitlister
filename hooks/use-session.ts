'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { AgentType } from '@/types/agents'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface Session {
  id: string
  agent_type: AgentType
  title: string
  messages: Message[]
  context: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface UseSessionOptions {
  agentType: AgentType
  autoCreate?: boolean
}

interface UseSessionReturn {
  session: Session | null
  sessions: Session[]
  isLoading: boolean
  error: string | null
  createSession: (title?: string) => Promise<Session | null>
  loadSession: (sessionId: string) => Promise<void>
  updateSession: (updates: Partial<Pick<Session, 'messages' | 'title' | 'context'>>) => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
  refreshSessions: () => Promise<void>
}

// LocalStorage helpers for dev mode
const STORAGE_KEY = 'saasify_sessions'

function getStoredSessions(): Session[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function setStoredSessions(sessions: Session[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    // Storage full or unavailable
  }
}

function getStoredSessionsByType(agentType: AgentType): Session[] {
  return getStoredSessions().filter(s => s.agent_type === agentType)
}

function addStoredSession(session: Session): void {
  const sessions = getStoredSessions()
  sessions.unshift(session)
  setStoredSessions(sessions)
}

function updateStoredSession(sessionId: string, updates: Partial<Session>): Session | null {
  const sessions = getStoredSessions()
  const index = sessions.findIndex(s => s.id === sessionId)
  if (index === -1) return null

  sessions[index] = { ...sessions[index], ...updates, updated_at: new Date().toISOString() }
  setStoredSessions(sessions)
  return sessions[index]
}

function deleteStoredSession(sessionId: string): void {
  const sessions = getStoredSessions().filter(s => s.id !== sessionId)
  setStoredSessions(sessions)
}

function getStoredSession(sessionId: string): Session | null {
  return getStoredSessions().find(s => s.id === sessionId) || null
}

export function useSession({ agentType, autoCreate = true }: UseSessionOptions): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDevMode, setIsDevMode] = useState(false)
  const initializedRef = useRef(false)

  // Check if we're in dev mode (no Supabase)
  useEffect(() => {
    const checkDevMode = async () => {
      try {
        const res = await fetch(`/api/sessions?agentType=${agentType}`)
        const data = await res.json()
        // If we get sessions from API, we're not in dev mode
        // But if we get an empty array and have local sessions, we're in dev mode
        const localSessions = getStoredSessionsByType(agentType)
        if (data.sessions?.length === 0 && localSessions.length > 0) {
          setIsDevMode(true)
        } else if (res.ok && !data.error) {
          // Check if the response indicates dev mode by trying to create a session
          // For now, assume dev mode if sessions are empty and we have local storage
          setIsDevMode(localSessions.length > 0 || data.sessions?.length === 0)
        }
      } catch {
        setIsDevMode(true)
      }
    }
    checkDevMode()
  }, [agentType])

  // Fetch all sessions for this agent type
  const refreshSessions = useCallback(async () => {
    try {
      // In dev mode, use localStorage
      const localSessions = getStoredSessionsByType(agentType)
      if (localSessions.length > 0) {
        setSessions(localSessions)
        return localSessions
      }

      const res = await fetch(`/api/sessions?agentType=${agentType}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch sessions')
      }

      // If API returns sessions, use them; otherwise use local
      if (data.sessions?.length > 0) {
        setSessions(data.sessions)
        return data.sessions
      }

      setSessions(localSessions)
      return localSessions
    } catch (err) {
      console.error('Failed to refresh sessions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions')
      // Fallback to localStorage
      const localSessions = getStoredSessionsByType(agentType)
      setSessions(localSessions)
      return localSessions
    }
  }, [agentType])

  // Create a new session
  const createSession = useCallback(async (title?: string): Promise<Session | null> => {
    try {
      setError(null)
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType,
          title: title || 'New Chat',
          messages: [],
          context: {},
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create session')
      }

      const newSession = data.session

      // Store in localStorage for dev mode persistence
      addStoredSession(newSession)

      setSession(newSession)
      setSessions((prev) => [newSession, ...prev])
      return newSession
    } catch (err) {
      console.error('Failed to create session:', err)
      setError(err instanceof Error ? err.message : 'Failed to create session')
      return null
    }
  }, [agentType])

  // Load a specific session
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setError(null)
      setIsLoading(true)

      // First try localStorage (for dev mode)
      const localSession = getStoredSession(sessionId)
      if (localSession) {
        setSession(localSession)
        setIsLoading(false)
        return
      }

      const res = await fetch(`/api/sessions/${sessionId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load session')
      }

      setSession(data.session)
    } catch (err) {
      console.error('Failed to load session:', err)
      setError(err instanceof Error ? err.message : 'Failed to load session')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update the current session
  const updateSession = useCallback(async (updates: Partial<Pick<Session, 'messages' | 'title' | 'context'>>) => {
    if (!session) return

    try {
      // Optimistically update local state
      const updatedSession = { ...session, ...updates, updated_at: new Date().toISOString() }
      setSession(updatedSession)

      // Update localStorage immediately for dev mode
      updateStoredSession(session.id, updates)

      const res = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const data = await res.json()

      if (!res.ok) {
        // Keep local state updated even if API fails (dev mode)
        console.warn('API update failed, using local storage')
        return
      }

      // Update with server response if available
      if (data.session) {
        setSession(data.session)
        updateStoredSession(session.id, data.session)
      }

      // Update in sessions list
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? (data.session || updatedSession) : s))
      )
    } catch (err) {
      console.error('Failed to update session:', err)
      // Don't revert - keep local changes for dev mode
    }
  }, [session])

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      setError(null)

      // Delete from localStorage
      deleteStoredSession(sessionId)

      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        console.warn('API delete failed:', data.error)
        // Continue anyway - local delete already done
      }

      // Remove from local state
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))

      // If current session was deleted, clear it
      if (session?.id === sessionId) {
        setSession(null)
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
      // Local delete already done, so state is updated
    }
  }, [session])

  // Initialize: fetch sessions and optionally create/load one
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const init = async () => {
      setIsLoading(true)

      // First check localStorage for existing sessions
      const localSessions = getStoredSessionsByType(agentType)

      if (localSessions.length > 0) {
        // Load most recent local session
        setSessions(localSessions)
        setSession(localSessions[0])
        setIsLoading(false)
        return
      }

      // No local sessions, try API
      const apiSessions = await refreshSessions()

      if (apiSessions.length > 0) {
        await loadSession(apiSessions[0].id)
      } else if (autoCreate) {
        await createSession()
      }

      setIsLoading(false)
    }

    init()
  }, [agentType]) // Only run on mount and agentType change

  return {
    session,
    sessions,
    isLoading,
    error,
    createSession,
    loadSession,
    updateSession,
    deleteSession,
    refreshSessions,
  }
}
