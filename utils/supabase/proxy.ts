import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })



  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const path = request.nextUrl.pathname

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (!path.startsWith('/auth') && path !== '/') {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    return supabaseResponse
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Role-based protection
  if (path.startsWith('/dashboard/player') && profile?.role !== 'player') {
    return NextResponse.redirect(new URL('/dashboard/organizer', request.url))
  }

  if (path.startsWith('/dashboard/organizer') && profile?.role !== 'organizer') {
    return NextResponse.redirect(new URL('/dashboard/player', request.url))
  }

  // Redirect to appropriate dashboard if accessing root dashboard
  if (path === '/dashboard') {
    if (profile?.role === 'organizer') {
      return NextResponse.redirect(new URL('/dashboard/organizer', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard/player', request.url))
  }

  return supabaseResponse
}
