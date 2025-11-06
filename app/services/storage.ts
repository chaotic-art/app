import type { FetchError } from 'ofetch'

const storageApi = $fetch.create({
  baseURL: URLS.services.nftStorage,
})

interface StorageApiResponse {
  ok: boolean
  value: {
    cid: string
    size: number
    type: string
    created: Date
  }
}

export async function pinJson(object: Record<string, any>) {
  const { value } = await storageApi<StorageApiResponse>('/pinJson', {
    method: 'POST',
    body: object,
  }).catch((error: FetchError) => {
    throw new Error(`Unable to PIN JSON for reasons ${error.data}`)
  })

  return value.cid
}

export async function pinDirectory(files: File[]) {
  const formData = new FormData()
  files.forEach(file => formData.append('file', file, file.name))

  const response = await storageApi<StorageApiResponse>('/pinFile', {
    method: 'POST',
    body: formData,
  }).catch((error: FetchError) => {
    throw new Error(`Unable to PIN Directory for reasons ${error.data}`)
  })

  return response.value.cid
}
