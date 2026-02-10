'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { sendWelcomeEmail } from '@/lib/resend/send-emails'

export type AuthActionResult = {
  error?: string
  success?: boolean
}

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Authentication is not configured. Please set up Supabase.' }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Authentication is not configured. Please set up Supabase.' }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/callback`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Send welcome email (non-blocking)
  sendWelcomeEmail(email, { userName: fullName || email.split('@')[0] }).catch((err) =>
    console.error('Failed to send welcome email:', err)
  )

  return { success: true }
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) {
    redirect('/login')
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signInWithGoogle(): Promise<void> {
  if (!isSupabaseConfigured()) {
    redirect('/login?error=' + encodeURIComponent('Authentication is not configured'))
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/callback`,
    },
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signInWithGithub(): Promise<void> {
  if (!isSupabaseConfigured()) {
    redirect('/login?error=' + encodeURIComponent('Authentication is not configured'))
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${origin}/callback`,
    },
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function resetPassword(formData: FormData): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Authentication is not configured. Please set up Supabase.' }
  }

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required' }
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password/update`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(formData: FormData): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Authentication is not configured. Please set up Supabase.' }
  }

  const password = formData.get('password') as string

  if (!password) {
    return { error: 'Password is required' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
