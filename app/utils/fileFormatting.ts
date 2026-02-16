export function formatFileSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getFileTypeLabel(type: string): string {
  if (type.startsWith('image/'))
    return type.replace('image/', '').toUpperCase()
  if (type.startsWith('video/'))
    return 'Video'
  if (type.startsWith('audio/'))
    return 'Audio'
  if (type.includes('gltf') || type.includes('glb'))
    return '3D Model'
  return 'File'
}
