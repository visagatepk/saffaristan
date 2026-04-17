import { createClient } from '@/lib/supabase/client'

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: 'seeker' | 'consultant'
) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })

  if (error) return { error }

  // Update profile with role
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ role, full_name: fullName })
      .eq('user_id', data.user.id)
  }

  return { data }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function getProfile(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}