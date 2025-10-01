import { fal } from '@fal-ai/client'
import { $fetch } from 'ofetch'

const MONICA_GENERATE_URL = 'https://monica.im'

const api = $fetch.create({ baseURL: '', retry: 3 })

interface GenerateRoastResponse {
  status: 'done' | 'streaming'
  analysis: {
    description: string
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
  // todo: remove mock data
  return Promise.resolve({
    data: {
      images: [{ url: 'https://v3b.fal.media/files/b/rabbit/4WvJUsR4th4xS-0yV8EzM.jpg' }],
    },
  })
  fal.config({
    credentials: useRuntimeConfig().public.falAiApiKey,
  })

  const result: {
    data: {
      images: { url: string }[]
    }
  } = await fal.subscribe('fal-ai/nano-banana/edit', {
    input: {
      prompt: 'Overlay a generative wireframe mesh across key surfaces of the subject--whether figurative or abstract--using grid lines that dynamically adopt colors from the image itself, prioritizing midtones or highlights for contrast. Introduce a secondary warped mesh element, resembling a topographically distorted layer, floating above or interwoven with the form to create a sense of architectural tension and controlled chaos. Use a deep black or navy background to enhance dimensionality. Preserve clarity in core contours or focal regions, allowing the mesh to define structure without overwhelming identity or form. The result should evoke a futuristic, surreal, and procedurally inspired aesthetic.',
      image_urls: [`${window.location.origin}/card/card_generate_bg.png`, imageUrl],
      num_images: 1,
      output_format: 'jpeg',
    },
    logs: true,
  })
  return result
}
