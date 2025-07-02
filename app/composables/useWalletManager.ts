import type { SubstrateWalletAccount } from '@/utils/wallet/substrate/types'

export default function useWalletManager() {
  const walletStore = useWalletStore()
  const { selectedAccounts } = storeToRefs(walletStore)

  async function disconnectWallet(wallet: WalletExtension) {
    const vm = wallet.vm

    await execByVm({
      EVM: () => {
        if (import.meta.client) {
          const { disconnect: disconnectReown } = useReown()

          return disconnectReown()
        }

        return Promise.resolve()
      },
    }, { vm })

    walletStore.updateWallet(wallet.id, {
      accounts: [],
      state: WalletStates.Disconnected,
    })

    if (selectedAccounts.value[vm]?.includes(wallet.id)) {
      selectedAccounts.value[vm] = undefined
    }
  }

  function formatEvmAccounts({
    account: { allAccounts: accounts },
    wallet,
    extension,
  }: { extension: WalletExtension } & UseReownOnAccountChangeParams): WalletAccount[] {
    return accounts.map(account => ({
      id: `${extension.id}:${wallet.rdns}/${account.address}`,
      vm: 'EVM',
      address: account.address,
      icon: wallet.icon,
    }))
  }

  function formatSubAccounts({
    accounts,
    extension,
  }: {
    accounts: SubstrateWalletAccount[]
    extension: WalletExtension
  }): WalletAccount[] {
    return accounts.map(account => ({
      id: `${extension.id}:${account.address}`,
      vm: 'SUB',
      address: account.address,
      name: account.name,
    }))
  }

  return {
    disconnectWallet,
    formatEvmAccounts,
    formatSubAccounts,
  }
}
