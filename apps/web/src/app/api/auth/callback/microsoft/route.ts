import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { signInWithMicrosoft } from '@/http/sign-in-with-microsoft'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const code = searchParams.get('code')

  console.log(code)

  if (!code) {
    return NextResponse.json(
      { message: 'Microsoft OAuth  code was not found.' },
      { status: 400 },
    )
  }

  const { token } = await signInWithMicrosoft({ code })

  cookies().set('token', token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7days
  })

  const redirectUrl = request.nextUrl.clone()

  redirectUrl.pathname = '/'
  redirectUrl.search = ''

  return NextResponse.redirect(redirectUrl)
}
