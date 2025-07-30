import type { ProfileFormData } from '@/components/profile/types'
import type { SocialLink } from '@/services/profile'
import type { SignaturePair } from '@/types'
import { uploadImage } from '@/services/profile'

export function constructSocials(profileData: ProfileFormData): SocialLink[] {
  return [
    {
      handle: profileData.farcasterHandle || '',
      platform: 'Farcaster',
      link: `https://warpcast.com/${profileData.farcasterHandle}`,
    },
    {
      handle: profileData.twitterHandle || '',
      platform: 'Twitter',
      link: `https://twitter.com/${profileData.twitterHandle}`,
    },
    {
      handle: profileData.website || '',
      platform: 'Website',
      link: profileData.website || '',
    },
  ].filter(social => Boolean(social.handle))
}

export async function uploadProfileImage({
  file,
  type,
  signaturePair: { signature, message },
}: {
  file: File | null
  type: 'image' | 'banner'
  signaturePair: SignaturePair
}): Promise<string | undefined> {
  if (!file) {
    return undefined
  }

  const { accountId } = useAuth()

  const response = await uploadImage({
    file,
    type,
    address: accountId.value,
    signature,
    message,
  })

  return response.url
}

export function addHttpToUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

interface LinkableBlock {
  id: string
  regex: RegExp
  template: (match: string) => string
}

export const LINKABLE_BLOCKS: LinkableBlock[] = [
  {
    id: 'channel',
    regex: /^\/\w+(?=\W|$)/,
    template: (match: string) => `https://warpcast.com/~/channel/${match.slice(1)}`,
  },
  {
    id: 'user',
    regex: /^@\w{1,15}(?=\W|$)/,
    template: (match: string) => `https://warpcast.com/${match.slice(1)}`,
  },
]

export const createLink = (content: string, url: string) => `[${content}](${url})`

function processSegment(segment: string): string {
  for (const { regex, template } of LINKABLE_BLOCKS) {
    const match = segment.match(regex)
    if (match) {
      const trailingText = segment.slice(match.index! + match[0].length)
      return createLink(match[0], template(match[0])) + trailingText
    }
  }

  return segment
}

export function getBioWithLinks(text: string): string {
  return text
    .split(/(\s+)/)
    .map(processSegment)
    .join('')
}
