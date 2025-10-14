export default function () {
  const route = useRoute()

  const fullPathShare = ref(`${window?.location.origin}${route.fullPath}`)

  const open = (url: string) => {
    window.open(url, '_blank')
  }

  const shareOnX = (
    text: string,
    url: string = fullPathShare.value,
    via: string | null = 'Chaotic',
  ) => {
    const shareUrl = new URL('https://twitter.com/intent/tweet')
    shareUrl.searchParams.set('text', text)
    if (via)
      shareUrl.searchParams.set('via', via)
    shareUrl.searchParams.set('url', url)
    open(shareUrl.toString())
  }

  const shareOnTelegram = (text: string, url: string = fullPathShare.value) => {
    const shareUrl = new URL('https://t.me/share/url')
    shareUrl.searchParams.set('url', url)
    shareUrl.searchParams.set('text', text)
    open(shareUrl.toString())
  }

  return {
    shareOnX,
    shareOnTelegram,
  }
}
