'use server'

import ky from 'ky'

const api = ky.create({
  prefixUrl: 'http://localhost:3333',
})

export async function signInWithEmailAndPassword(data: FormData) {
  const { email, password } = Object.fromEntries(data)

  const result = api
    .post('sessions/password', {
      json: {
        email,
        password,
      },
    })
    .json()

  console.log(result)
}
