'use server'

import { z } from 'zod'

import { signInWithPassword } from '@/http/sign-in-with-password'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function signInWithEmailAndPassword(_: unknown, data: FormData) {
  const result = signInSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors

    return { success: false, message: null, errors }
  }

  const { email, password } = result.data

  await new Promise((resolve) => setTimeout(resolve, 2000))

  const { token } = await signInWithPassword({
    email: String(email),
    password: String(password),
  })

  console.log(token)

  return { success: true, message: null, errors: null }
}
