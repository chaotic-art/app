import { $fetch } from 'ofetch'

const BASE_URL = 'https://sign-in-with-x.dotlab.workers.dev'

const api = $fetch.create({
  baseURL: BASE_URL,
})

export async function mintXCard(
  { description, imageUrl, magic, address }: { description: string, imageUrl: string, magic: string, address: string },
) {
  const response = await api<{ mintContext: {
    sn: string
    chain: string
    collection: string
    metadata: string
    address: string
  } }>('/auth/mint', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${magic}`,
    },
    body: {
      description,
      imageUrl,
      address,
    },
  }).catch(() => {
    throw new Error('you can only claim once per account.')
  })
  return response
}
