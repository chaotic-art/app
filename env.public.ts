import process from 'node:process'
import { literal, object, optional, pipe, safeParse, string, transform, union, url } from 'valibot'

const DEFAULT_SITE_URL = 'https://chaotic.art'
const DEFAULT_REOWN_PROJECT_ID = 'b56e18d47c72ab683b10814fe9495694'
const DEFAULT_SITE_INDEXABLE = false

const publicEnvSchema = object({
  SITE_URL: optional(pipe(string(), url())),
  SITE_INDEXABLE: optional(pipe(
    union([literal('true'), literal('false')]),
    transform(value => value === 'true'),
  )),
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
  siteIndexable: parsedEnv.SITE_INDEXABLE ?? DEFAULT_SITE_INDEXABLE,
  siteUrl: (parsedEnv.SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, ''),
}
