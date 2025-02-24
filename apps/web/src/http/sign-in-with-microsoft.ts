import { api } from './api-client'

interface SignInWithMicrosoftRequest {
  code: string
}

interface SignInWithMicrosoftResponse {
  token: string
}

export async function signInWithMicrosoft({
  code,
}: SignInWithMicrosoftRequest) {
  const result = await api
    .post('sessions/microsoft', {
      json: {
        code,
      },
    })
    .json<SignInWithMicrosoftResponse>()

  return result
}
