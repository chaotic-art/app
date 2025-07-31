import { openConnectWalletModal } from '@/components/wallet/connect/utils'

export interface DoAfterLoginParams {
  onLoginSuccess: (account?: string) => void
  onCancel?: () => void
}

export default function () {
  const doAfterLogin = ({ onLoginSuccess, onCancel }: DoAfterLoginParams) => {
    const { isLogIn } = useAuth()
    if (!isLogIn.value) {
      openConnectWalletModal({
        onConnect: onLoginSuccess,
        onCancel,
      })
    }
    else {
      onLoginSuccess()
    }
  }
  return {
    doAfterLogin,
  }
}
