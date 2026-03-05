import { $fetch as $ofetch } from 'ofetch'

const MONICA_GENERATE_URL = 'https://monica.im'

const api = $ofetch.create({ baseURL: '', retry: 3 })

interface GenerateRoastResponse {
  status: 'done' | 'streaming'
  analysis: {
    description: string
    lifeMotto: string
  }

}
export async function generateRoastByXUserName(userId: string) {
  return await api<string>(`${MONICA_GENERATE_URL}/api/roast/generate`, {
    method: 'POST',
    body: {
      locale: 'auto',
      platform: 'twitter',
      user_id: userId,
    },
  }).then((res) => {
    return JSON.parse((JSON.parse(res?.split('data: ')[1] || '{}').text)) as GenerateRoastResponse
  })
}

export async function waitForXRoastGenerationComplete(username: string) {
  const maxAttempts = 30 // Maximum number of polling attempts
  const pollInterval = 3000 // Poll every 2 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await generateRoastByXUserName(username)

      if (response.status === 'done') {
        return response
      }

      // If not done, wait before next attempt
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }
    }
    catch (error) {
      console.error('Error polling generation status:', error)
      if (attempt === maxAttempts - 1) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }
  }

  throw new Error('Generation did not complete within the expected time')
}

export async function generateMixedImageByFalAi(imageUrl: string) {
  const result = await $fetch('/api/fal/mixed-image', {
    method: 'POST',
    body: {
      imageUrl,
    },
  })

  return result
}
