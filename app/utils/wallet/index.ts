import type { SubstrateWalletAccount } from '@/utils/wallet/substrate/types'

export interface EvmWalletAccount {
  address: string
}

export function formatEvmAccounts({
  accounts,
  extension,
}: {
  accounts: EvmWalletAccount[]
  extension: WalletExtension
}): WalletAccount[] {
  return accounts.map(account => ({
    id: `${extension.id}:${account.address}`,
    vm: 'EVM',
    address: account.address,
    icon: extension.icon,
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
