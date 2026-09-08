'use server'

import { createServerSupabaseClient } from './supabase-server'

export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function isPremiumServer(): Promise<boolean> {
  const profile = await getUserProfile()
  if (!profile) return false
  if (!profile.is_premium) return false
  if (profile.premium_until && new Date(profile.premium_until) < new Date()) return false
  return true
}
