// FILE: lib/supabase/checkUnique.ts
// Reusable helper to check if a value already exists in profiles

import { createClient } from '@/lib/supabase/client'

export async function checkPhoneUnique(phone: string, excludeUserId?: string): Promise<boolean> {
  const supabase = createClient()
  let query = supabase.from('profiles').select('user_id').eq('phone', phone)
  if (excludeUserId) query = query.neq('user_id', excludeUserId)
  const { data } = await query
  return !data || data.length === 0
}

export async function checkOepUnique(oep: string, excludeUserId?: string): Promise<boolean> {
  const supabase = createClient()
  let query = supabase.from('profiles').select('user_id').eq('oep_license_number', oep.toUpperCase())
  if (excludeUserId) query = query.neq('user_id', excludeUserId)
  const { data } = await query
  return !data || data.length === 0
}

export async function checkNtnUnique(ntn: string, excludeUserId?: string): Promise<boolean> {
  const supabase = createClient()
  let query = supabase.from('profiles').select('user_id').eq('ntn_number', ntn)
  if (excludeUserId) query = query.neq('user_id', excludeUserId)
  const { data } = await query
  return !data || data.length === 0
}

export async function checkEmailUnique(email: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('user_id').eq('email', email)
  return !data || data.length === 0
}