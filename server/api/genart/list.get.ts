import type { GenartListResponse } from '~/types/genart'
import * as v from 'valibot'
import { GENART_WORKERS_URL, vValidateQuery } from '~~/server/utils/endpoint'

// Query parameters schema
const querySchema = v.object({
  limit: v.optional(v.pipe(v.string(), v.transform(Number), v.number()), '10'),
  order_by: v.optional(v.pipe(v.string(), v.picklist(['start_at_desc', 'start_at_asc', 'created_at_desc', 'created_at_asc'])), 'start_at_desc'),
  creator: v.optional(v.string()),
  collection: v.optional(v.string()),
  chain: v.optional(v.string(), 'ahp'),
  active: v.optional(v.pipe(v.string(), v.transform(val => val === 'true' ? 1 : val === 'false' ? 0 : Number(val)), v.number()), '1'),
  alias: v.optional(v.string()),
})

export default defineEventHandler(async (event) => {
  // Validate query parameters using the utility function
  const validatedQuery = vValidateQuery(event, querySchema)

  const response = await $fetch(`${GENART_WORKERS_URL}/drops`, {
    query: validatedQuery,
  })

  // Return the API response
  return response as Response
})

interface Response extends GenartListResponse {}
