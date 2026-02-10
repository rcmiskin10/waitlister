'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getCurrentUser } from '@/lib/supabase/server'
import { entityConfig } from '@/config/entity'
import { buildEntitySchema } from '@/lib/validations/entity'

// The entity table in Supabase is always 'entities'.
// When IdeaLaunch generates an MVP, this table is created with
// columns matching the entity config fields.
const TABLE_NAME = 'entities'

export interface EntityRecord {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export async function listEntities(): Promise<EntityRecord[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  // Use .from() with type assertion for dynamic table
  const { data, error } = await (supabase as any)
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', user.id)
    .order(entityConfig.defaultSort.field, {
      ascending: entityConfig.defaultSort.direction === 'asc',
    })

  if (error) {
    console.error(`Error listing ${TABLE_NAME}:`, error)
    return []
  }

  return (data as EntityRecord[]) || []
}

export async function getEntity(id: string): Promise<EntityRecord | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error(`Error fetching ${TABLE_NAME}:`, error)
    return null
  }

  return data as EntityRecord
}

export async function createEntity(
  formData: Record<string, unknown>
): Promise<{ success: boolean; id?: string; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const schema = buildEntitySchema()
  const parsed = schema.safeParse(formData)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return { success: false, error: firstIssue?.message || 'Validation failed' }
  }

  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from(TABLE_NAME)
    .insert({ ...parsed.data, user_id: user.id })
    .select('id')
    .single()

  if (error) {
    console.error(`Error creating ${TABLE_NAME}:`, error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/entities')
  return { success: true, id: (data as { id: string }).id }
}

export async function updateEntity(
  id: string,
  formData: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const schema = buildEntitySchema()
  const parsed = schema.safeParse(formData)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return { success: false, error: firstIssue?.message || 'Validation failed' }
  }

  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from(TABLE_NAME)
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error(`Error updating ${TABLE_NAME}:`, error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/entities')
  revalidatePath(`/dashboard/entities/${id}`)
  return { success: true }
}

export async function deleteEntity(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  if (!entityConfig.allowDelete) {
    return { success: false, error: 'Delete is not allowed' }
  }

  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error(`Error deleting ${TABLE_NAME}:`, error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/entities')
  return { success: true }
}
