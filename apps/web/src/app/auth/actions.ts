'use server'

import { env } from '@saas/env'
import { redirect } from 'next/navigation'

export async function signInWithGithub() {
  const githubSignInURL = new URL('login/oauth/authorize', 'https://github.com')

  githubSignInURL.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID)
  githubSignInURL.searchParams.set(
    'redirect_uri',
    env.GITHUB_OAUTH_CLIENT_REDIRECT_URI,
  )
  githubSignInURL.searchParams.set('scope', 'user')

  redirect(githubSignInURL.toString())
}
export async function signInWithMicrosoft() {
  const microsoftSignInURL = new URL(
    'https://login.microsoftonline.com/8809886d-b66e-4978-b202-ec67fb73367f/oauth2/v2.0/authorize',
  )

  microsoftSignInURL.searchParams.set(
    'client_id',
    env.AUTH_MICROSOFT_ENTRA_ID_CLIENT_ID,
  )
  microsoftSignInURL.searchParams.set('response_type', 'code')
  microsoftSignInURL.searchParams.set(
    'redirect_uri',
    env.AUTH_MICROSOFT_ENTRA_ID_REDIRECT_URI,
  )
  microsoftSignInURL.searchParams.set('scope', '.default')

  redirect(microsoftSignInURL.toString())
}
