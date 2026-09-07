import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code             = searchParams.get('code')
  const oauthError       = searchParams.get('error')
  const oauthErrorDesc   = searchParams.get('error_description')
  const next             = searchParams.get('next') ?? '/'

  // Google/Supabase returned an explicit OAuth error
  if (oauthError) {
    const reason = oauthError === 'access_denied' ? 'access_denied' : 'oauth_error'
    const desc   = oauthErrorDesc ? encodeURIComponent(oauthErrorDesc) : ''
    return NextResponse.redirect(`${origin}/auth/auth-error?reason=${reason}&desc=${desc}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-error?reason=no_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()    { return cookieStore.getAll() },
        setAll(set) { try { set.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('Auth callback error:', error.message)
    return NextResponse.redirect(`${origin}/auth/auth-error?reason=exchange_failed`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
