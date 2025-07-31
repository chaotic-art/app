import { LazyWalletConnectModal } from '#components'

interface OpenConnectWalletModalParams {
  onConnect?: () => void
  onCancel?: () => void
}

export function openConnectWalletModal({ onConnect, onCancel }: OpenConnectWalletModalParams) {
  const overlay = useOverlay()
  const modal = overlay.create(LazyWalletConnectModal, { destroyOnClose: true })
  const instance = modal.open()

  instance.result.then((account) => {
    if (account) {
      onConnect?.()
    }
    else {
      onCancel?.()
    }
  })
}
