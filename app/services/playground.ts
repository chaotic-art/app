import { $fetch } from 'ofetch'

const api = $fetch.create({
  baseURL: URLS.services.playground,
})

export const getObjectUrl = (key: string) => `${URLS.services.playground_bucket}/${key}`

interface UploadFilesResponse { key: string }

export async function uploadFile({
  file,
  fileName,
  prefix,
}: {
  file: Blob
  fileName: string
  prefix?: string
}) {
  const form = new FormData()

  form.append('file', file, fileName)

  if (prefix) {
    form.append('prefix', prefix)
  }

  return await api<UploadFilesResponse>('/upload', {
    method: 'POST',
    body: form,
  })
}

interface UploadAvailableResponse { key: string }

export async function getUpload(key: string) {
  return await api<UploadAvailableResponse>('/upload', {
    method: 'GET',
    params: {
      key,
    },
  })
}
