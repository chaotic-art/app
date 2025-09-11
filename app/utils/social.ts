export interface SocialPlatform {
  name: string
  icon: string
  color: string
  baseUrl?: string
}

export const socialPlatforms: Record<string, SocialPlatform> = {
  twitter: {
    name: 'Twitter',
    icon: 'i-lucide-twitter',
    color: 'text-blue-500',
    baseUrl: 'https://twitter.com/',
  },
  x: {
    name: 'X',
    icon: 'i-lucide-twitter',
    color: 'text-gray-900 dark:text-white',
    baseUrl: 'https://x.com/',
  },
  instagram: {
    name: 'Instagram',
    icon: 'i-lucide-instagram',
    color: 'text-pink-500',
    baseUrl: 'https://instagram.com/',
  },
  discord: {
    name: 'Discord',
    icon: 'i-lucide-message-circle',
    color: 'text-indigo-500',
    baseUrl: 'https://discord.gg/',
  },
  telegram: {
    name: 'Telegram',
    icon: 'i-lucide-send',
    color: 'text-blue-400',
    baseUrl: 'https://t.me/',
  },
  github: {
    name: 'GitHub',
    icon: 'i-lucide-github',
    color: 'text-gray-800 dark:text-gray-200',
    baseUrl: 'https://github.com/',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'i-lucide-linkedin',
    color: 'text-blue-600',
    baseUrl: 'https://linkedin.com/in/',
  },
  youtube: {
    name: 'YouTube',
    icon: 'i-lucide-youtube',
    color: 'text-red-500',
    baseUrl: 'https://youtube.com/@',
  },
  tiktok: {
    name: 'TikTok',
    icon: 'i-lucide-music',
    color: 'text-gray-900 dark:text-white',
    baseUrl: 'https://tiktok.com/@',
  },
  website: {
    name: 'Website',
    icon: 'i-lucide-globe',
    color: 'text-gray-600 dark:text-gray-400',
  },
  email: {
    name: 'Email',
    icon: 'i-lucide-mail',
    color: 'text-gray-600 dark:text-gray-400',
    baseUrl: 'mailto:',
  },
}

/**
 * Get social platform information by platform name
 */
export function getSocialPlatform(platform: string): SocialPlatform {
  const normalizedPlatform = platform.toLowerCase().trim()

  // Check for exact match first
  if (socialPlatforms[normalizedPlatform]) {
    return socialPlatforms[normalizedPlatform]
  }

  // Check for partial matches
  const platformKey = Object.keys(socialPlatforms).find(key =>
    normalizedPlatform.includes(key) || key.includes(normalizedPlatform),
  )

  if (platformKey) {
    return socialPlatforms[platformKey]!
  }

  // Default fallback
  return {
    name: platform,
    icon: 'i-lucide-link',
    color: 'text-muted-foreground',
  }
}

/**
 * Generate full URL for social platform
 */
export function getSocialUrl(platform: string, handle: string): string {
  const platformInfo = getSocialPlatform(platform)

  // If it's already a full URL, return as is
  if (handle.startsWith('http://') || handle.startsWith('https://')) {
    return handle
  }

  // If platform has a base URL, construct the full URL
  if (platformInfo.baseUrl) {
    // Remove @ symbol if present at the beginning
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle
    return `${platformInfo.baseUrl}${cleanHandle}`
  }

  // For platforms without base URL (like email), return the handle as is
  return handle
}

/**
 * Format social handle for display
 */
export function formatSocialHandle(platform: string, handle: string): string {
  const normalizedPlatform = platform.toLowerCase().trim()

  // For certain platforms, ensure @ prefix for display
  if (['twitter', 'x', 'instagram', 'tiktok'].includes(normalizedPlatform)) {
    return handle.startsWith('@') ? handle : `@${handle}`
  }

  return handle
}

/**
 * Check if a social platform is valid
 */
export function isValidSocialPlatform(platform: string): boolean {
  return Object.keys(socialPlatforms).includes(platform.toLowerCase().trim())
}
