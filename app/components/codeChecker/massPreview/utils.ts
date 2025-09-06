export const AssetElementMap = {
  script: {
    tag: 'script',
    src: 'src',
  },
  link: {
    tag: 'link',
    src: 'href',
  },
  img: {
    tag: 'img',
    src: 'src',
  },
} as const

export function downloadBase64Image(base64: string, filename: string) {
  const link = document.createElement('a')
  link.href = base64
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
