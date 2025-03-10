import { env } from '@saas/env'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function authenticateWithMicrosoft(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/microsoft',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with Microsoft',
        body: z.object({
          code: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body

      const microsoftOAuthURL = new URL(
        `https://login.microsoftonline.com/${env.AUTH_MICROSOFT_ENTRA_ID_TENANT}/oauth2/v2.0/token`,
      )

      const formData = new URLSearchParams()
      formData.append('client_id', env.AUTH_MICROSOFT_ENTRA_ID_CLIENT_ID)
      formData.append('scope', '.default')
      formData.append('code', code)
      formData.append('redirect_uri', env.AUTH_MICROSOFT_ENTRA_ID_REDIRECT_URI)
      formData.append('grant_type', 'authorization_code')
      formData.append('client_secret', env.AUTH_MICROSOFT_ENTRA_ID_SECRET)

      const microsoftAccessTokenResponse = await fetch(microsoftOAuthURL, {
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      const microsoftAccessTokenData = await microsoftAccessTokenResponse.json()

      const { access_token: microsoftAccessToken } = z
        .object({
          access_token: z.string(),
          token_type: z.literal('Bearer'),
          scope: z.string(),
        })
        .parse(microsoftAccessTokenData)

      const microsoftUserResponse = await fetch(
        'https://graph.microsoft.com/v1.0/me',
        {
          headers: {
            Authorization: `Bearer ${microsoftAccessToken}`,
          },
        },
      )

      const microsoftUserData = await microsoftUserResponse.json()

      const {
        id: microsoftId,
        givenName,
        mail,
      } = z
        .object({
          id: z.string(),
          givenName: z.string(),
          mail: z.string(),
        })
        .parse(microsoftUserData)

      if (mail === null) {
        throw new BadRequestError(
          'Your Microsoft account must have an email to authenticate.',
        )
      }

      let user = await prisma.user.findUnique({
        where: { email: mail },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: givenName,
            email: mail,
            avatarUrl: null,
          },
        })
      }

      let account = await prisma.account.findUnique({
        where: {
          provider_userId: {
            provider: 'MICROSOFT',
            userId: user.id,
          },
        },
      })

      if (!account) {
        account = await prisma.account.create({
          data: {
            provider: 'MICROSOFT',
            providerAccountId: microsoftId,
            userId: user.id,
          },
        })
      }

      const token = await reply.jwtSign(
        {
          sub: user.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        },
      )

      return reply.status(201).send({ token })
    },
  )
}
