export function removeHttpFromUrl(url: string) {
  return url.replace(/^https?:\/\//, '')
}

export function addHttpToUrl(url: string) {
  return url.startsWith('http') ? url : `https://${url}`
}
