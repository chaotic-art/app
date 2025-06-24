import { useEventListener } from '@vueuse/core'

type KodaHashEventType = 'kodahash/render/completed'

interface KodasHashEvent {
  type: KodaHashEventType
  payload: {
    hash: string
    image: string
    type: string
    search: string
    attributes: unknown[]
  }
}

export function onKodahashRenderCompleted(callback: (event: KodasHashEvent) => void) {
  useEventListener(window, 'message', (e: MessageEvent<KodasHashEvent>) => {
    if (e.data?.type === 'kodahash/render/completed' && e.data.payload) {
      callback(e.data)
    }
  })
}
