export function nsfwAttribute(nsfw: boolean): Record<string, string | number>[] {
  if (!nsfw) {
    return []
  }

  return [{ trait_type: 'NSFW', value: Number(nsfw) }]
}

export function isNsfwNft(attributes?: Record<string, string | number>[]): boolean {
  if (!attributes) {
    return false
  }

  return attributes.some(attr => attr.trait_type === 'NSFW' && attr.value === 1)
}
