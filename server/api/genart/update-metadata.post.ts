import { boolean, object, optional, string } from 'valibot'
import { GENART_WORKERS_URL, vValidateBody } from '~~/server/utils/endpoint'

// Valibot schema for updateMetadata request body
const UpdateMetadataSchema = object({
  chain: string(),
  collection: string(),
  nft: string(),
  isChaoticOwner: optional(boolean()),
})

export default defineEventHandler(async (event) => {
  const validatedBody = await vValidateBody(event, UpdateMetadataSchema)

  const { isChaoticOwner = true, ...body } = validatedBody
  const path = isChaoticOwner ? 'drops/update-metadata' : 'drops/update-metadata-old'

  const response = await $fetch(`${GENART_WORKERS_URL}/${path}`, {
    method: 'POST',
    body,
  })

  return response
})
