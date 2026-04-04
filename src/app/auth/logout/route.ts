import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const response = NextResponse.redirect(
    new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  )
  
  // Clear the auth token cookie
  response.cookies.set('digitn_token', '', {
    maxAge: 0,
    path: '/',
  })

  return response
}
