import type { BaseSchema } from 'valibot'
import { safeParse } from 'valibot'

export const GENART_WORKERS_URL = 'https://genart.chaotic.art'

// Generic validation function for request bodies using Valibot
export async function vValidateBody<T>(
  event: any,
  schema: BaseSchema<any, T, any>,
): Promise<T> {
  const body = await readBody(event)
  const result = safeParse(schema, body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    })
  }

  return result.output
}
