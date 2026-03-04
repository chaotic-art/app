import { minLength, object, optional, pipe, safeParse, string, url } from 'valibot'

const DEFAULT_SITE_URL = 'https://chaotic.art'

const envSchema = object({
  NUXT_FAL_AI_API_KEY: pipe(string(), minLength(1)),
  NUXT_PUBLIC_SITE_URL: optional(pipe(string(), url())),
  NUXT_PUBLIC_REOWN_CONNECT_PROJECT_ID: optional(string()),
})

const parseResult = safeParse(envSchema, import.meta.env)

if (!parseResult.success) {
  const envIssueMessage = parseResult.issues.map(issue => issue.message).join('; ')
  throw new Error(`Invalid environment variables: ${envIssueMessage}`)
}

const parsedEnv = parseResult.output

export const env = {
  server: {
    falAiApiKey: parsedEnv.NUXT_FAL_AI_API_KEY,
  },
  client: {
    reownProjectId: parsedEnv.NUXT_PUBLIC_REOWN_CONNECT_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694',
    siteUrl: (parsedEnv.NUXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, ''),
  },
}
