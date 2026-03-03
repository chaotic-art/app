import { object, optional, pipe, safeParse, string, url } from 'valibot'

const DEFAULT_SITE_URL = 'https://chaotic.art'

const envSchema = object({
  NUXT_PUBLIC_SITE_URL: optional(pipe(string(), url())),
})

const parsedEnv = safeParse(envSchema, import.meta.env)

if (!parsedEnv.success) {
  const envIssueMessage = parsedEnv.issues.map(issue => issue.message).join('; ')
  throw new Error(`Invalid environment variables: ${envIssueMessage}`)
}

export const env = parsedEnv.output
export const publicSiteUrl = (env.NUXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, '')
