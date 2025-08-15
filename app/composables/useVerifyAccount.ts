import type { SignaturePair } from '@/types'
import { useSignMessage } from '@wagmi/vue'
import { isEvmAddress, toU8a, u8aToHex } from 'dedot/utils'

async function signMessagePolkadot(address: string, message: string) {
  const { getConnectedSubAccount } = storeToRefs(useWalletStore())

  const signer = await getConnectedSubAccount.value?.signer

  if (!signer) {
    throw new Error('No signer found for the connected Polkadot account')
  }

  const signedMessageU8a = await signer.signBytes(toU8a(message))

  return u8aToHex(signedMessageU8a)
}

export const SIGNATURE_MESSAGE = 'Verify ownership of this account on Chaotic'

export default function useVerifyAccount() {
  const { accountId } = useAuth()
  const accountStore = useAccountStore()
  const { vm } = useChain()
  const authSignature = computed(() => accountStore.getAuthSignature(vm.value))
  const { signMessageAsync } = useSignMessage()

  const signMessageEthereum = async (address: string, message: string) => {
    const signedMessage = await signMessageAsync({
      account: address as `0x${string}`,
      message,
    })

    // console.log('Signed evm message:', { message, address, signedMessage })
    return signedMessage
  }

  const getSignedMessage = async () => {
    if (!accountId.value) {
      throw new Error('Please connect your wallet first')
    }
    if (authSignature.value) {
      return authSignature.value
    }

    const signMessageFn = isEvmAddress(accountId.value)
      ? signMessageEthereum
      : signMessagePolkadot
    const signature = await signMessageFn(accountId.value, SIGNATURE_MESSAGE)

    if (signature) {
      accountStore.setAuth({ vm: vm.value, address: accountId.value, authSignature: signature })
      return signature
    }

    throw new Error('You have not completed address verification')
  }

  const getSignaturePair = async (): Promise<SignaturePair> => {
    const signature = await getSignedMessage()
    return {
      signature,
      message: SIGNATURE_MESSAGE,
    }
  }

  return {
    getSignaturePair,
  }
}
