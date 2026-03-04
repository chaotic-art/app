import { fal } from '@fal-ai/client'
import { object, pipe, string, url } from 'valibot'
import { vValidateBody } from '~~/server/utils/endpoint'

const mixedImageSchema = object({
  imageUrl: pipe(string(), url()),
})

const MIXED_IMAGE_PROMPT = 'Overlay a generative wireframe mesh across key surfaces of the subject--whether figurative or abstract--using grid lines that dynamically adopt colors from the image itself, prioritizing midtones or highlights for contrast. Introduce a secondary warped mesh element, resembling a topographically distorted layer, floating above or interwoven with the form to create a sense of architectural tension and controlled chaos. Use a deep black or navy background to enhance dimensionality. Preserve clarity in core contours or focal regions, allowing the mesh to define structure without overwhelming identity or form. The result should evoke a futuristic, surreal, and procedurally inspired aesthetic.'

interface FalSubscribeResult {
  data: {
    images: { url: string }[]
  }
}

export default defineEventHandler(async (event): Promise<FalSubscribeResult> => {
  const { imageUrl } = await vValidateBody(event, mixedImageSchema)
  const runtimeConfig = useRuntimeConfig(event)

  if (!runtimeConfig.falAiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'FAL API key is not configured',
    })
  }

  const requestOrigin = getRequestURL(event).origin
  const baseOrigin = requestOrigin || runtimeConfig.public.siteUrl

  fal.config({
    credentials: runtimeConfig.falAiApiKey,
  })

  try {
    const result = await fal.subscribe('fal-ai/nano-banana/edit', {
      input: {
        prompt: MIXED_IMAGE_PROMPT,
        image_urls: [`${baseOrigin}/card/card_generate_bg.png`, imageUrl],
        num_images: 1,
        output_format: 'jpeg',
      },
      logs: true,
    }) as FalSubscribeResult

    return result
  }
  catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: `Failed to generate mixed image: ${(error as Error)?.message || 'Unknown error'}`,
    })
  }
})
