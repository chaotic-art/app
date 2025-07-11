import type { SubstrateWalletAccount } from '@/utils/wallet/substrate/types'

export function formatEvmAccounts({
  accounts,
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

export function formatSubAccounts({
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
