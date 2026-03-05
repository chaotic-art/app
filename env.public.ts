import process from 'node:process'
import { object, optional, pipe, safeParse, string, url } from 'valibot'

const DEFAULT_SITE_URL = 'https://chaotic.art'
const DEFAULT_REOWN_PROJECT_ID = 'b56e18d47c72ab683b10814fe9495694'

const publicEnvSchema = object({
  SITE_URL: optional(pipe(string(), url())),
  REOWN_CONNECT_PROJECT_ID: optional(string()),
})

const parseResult = safeParse(publicEnvSchema, process.env)

if (!parseResult.success) {
  const envIssueMessage = parseResult.issues.map(issue => issue.message).join('; ')
  throw new Error(`Invalid public environment variables: ${envIssueMessage}`)
}

const parsedEnv = parseResult.output

export const publicEnv = {
  reownProjectId: parsedEnv.REOWN_CONNECT_PROJECT_ID || DEFAULT_REOWN_PROJECT_ID,
  siteUrl: (parsedEnv.SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, ''),
}
