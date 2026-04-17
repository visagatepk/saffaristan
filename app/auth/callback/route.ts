import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') || 'seeker'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, verification_status, business_name')
        .eq('user_id', data.user.id)
        .single()

      // New Google user — set role from URL param
      if (!profile?.role || profile.role === 'seeker') {
        if (role === 'consultant') {
          await supabase
            .from('profiles')
            .update({ role: 'consultant' })
            .eq('user_id', data.user.id)

          // Redirect to complete consultant profile
          return NextResponse.redirect(`${origin}/register/consultant/complete-profile`)
        }
        return NextResponse.redirect(`${origin}/dashboard/seeker`)
      }

      // Existing consultant — check if profile complete
      if (profile.role === 'consultant') {
        if (!profile.business_name) {
          return NextResponse.redirect(`${origin}/register/consultant/complete-profile`)
        }
        return NextResponse.redirect(`${origin}/dashboard/consultant`)
      }

      return NextResponse.redirect(`${origin}/dashboard/seeker`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}