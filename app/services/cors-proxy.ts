export function getCorsProxiedUrl(url: string): string {
  return `${URLS.services.cors_proxy}/?url=${encodeURIComponent(url)}`
}
