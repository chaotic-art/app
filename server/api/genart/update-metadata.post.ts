import { object, string } from 'valibot'
import { GENART_WORKERS_URL, readValidatedBody } from '~~/server/utils/endpoint'

// Valibot schema for updateMetadata request body
const UpdateMetadataSchema = object({
  chain: string(),
  collection: string(),
  nft: string(),
})

export default defineEventHandler(async (event) => {
  const validatedBody = await readValidatedBody(event, UpdateMetadataSchema)

  const response = await $fetch(`${GENART_WORKERS_URL}/drops/update-metadata`, {
    method: 'POST',
    body: validatedBody,
  })

  return response
})
