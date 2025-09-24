import type { BaseSchema } from 'valibot'
import { parse, safeParse, ValiError } from 'valibot'

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

// Generic validation function for query parameters using Valibot
export function vValidateQuery<T>(
  event: any,
  schema: BaseSchema<any, T, any>,
): T {
  try {
    // Get query parameters from the request
    const query = getQuery(event)

    // Validate query parameters against the schema
    const validatedQuery = parse(schema, query)

    return validatedQuery
  }
  catch (error) {
    // Handle validation errors
    if (error instanceof ValiError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid query parameters',
        data: {
          errors: error.issues.map(issue => ({
            path: issue.path?.map((p: any) => p.key).join('.') || 'root',
            message: issue.message,
            input: issue.input,
          })),
        },
      })
    }

    // Handle other errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
}
