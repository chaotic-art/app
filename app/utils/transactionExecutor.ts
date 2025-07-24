import type { Transaction as PapiTransaction, TxEvent } from 'polkadot-api'
import type { Observer } from 'rxjs'
import { toDefaultAddress } from '@/utils/account'
import { getWalletSigner } from '@/utils/extension'

// export type ExecResult = UnsubscribeFn | string
// export type Extrinsic = SubmittableExtrinsic<'promise'>

export type UnsubscribeFn = () => string
type Transaction = PapiTransaction<any, any, any, any>
type SubscriptionObserver = Partial<Observer<TxEvent>>

async function exec(
  address: string,
  callback: (...params: any[]) => Promise<Transaction>,
  params: any[],
  observer: SubscriptionObserver,
): Promise<any> {
  try {
    const transaction = await callback(...params)

    const signer = await getWalletSigner(toDefaultAddress(address))

    if (!signer) {
      throw new Error('Oops! We can\'t find your wallet, please log in again.')
    }

    transaction.signSubmitAndWatch(signer)
      .subscribe(observer)
  }
  catch (err) {
    console.warn(err)
    throw err
  }
}

export type TxObserverOnSuccessCallback = (params: { blockNumber: number, txHash: string }) => void
export type TxObserverOnErrorCallback = (err: any) => void
export type TxObserverOnResultCallback = (result: TxEvent) => void

export function txObserver(
  onSuccess: TxObserverOnSuccessCallback,
  onError: TxObserverOnErrorCallback,
  onResult: TxObserverOnResultCallback = console.log,
): SubscriptionObserver {
  return {
    next(event) {
      onResult(event)

      console.log('tx type:', event.type)
      console.log('tx hash:', event.txHash)

      if (event.type === 'finalized') {
        onSuccess({
          blockNumber: event.block.number,
          txHash: event.txHash,
        })
      }
    },
    complete() {
      // (OPTIONAL) DESTROY CLIENT ON COMPLETION
      // console.log('Shutting down smoldot...');
      // client.destroy();
      console.log('Tx was completed successfully!')
    },
    error(err) {
      onError(err)
    },
  }
}

// export async function estimate(account: KeyringAccount | string, callback: (...params: any) => SubmittableExtrinsic<'promise'>, params: any[]): Promise<string> {
//   const transfer = await callback(...params)
//   const address
//     = typeof account === 'string' ? account ?? CHAOTIC_DAO : account.address
//   // if user have not connect wallet, we provide a mock address to estimate fee
//   const injector = await getWalletSigner(toDefaultAddress(address))

//   const info = await transfer.paymentInfo(
//     address,
//     injector ? { signer: injector.signer } : {},
//   )
//   return info.partialFee.toString()
// }

// async function estimateEvm({ arg, abi, functionName, account, prefix, address }: ExecuteEvmTransactionParams & { account: string, prefix: Prefix }) {
//   const { $wagmiConfig } = useNuxtApp()

//   const [estimatedGas, gasPrice] = await Promise.all([
//     estimateGas($wagmiConfig, {
//       account: account as Address,
//       to: address as Address,
//       data: encodeFunctionData({
//         abi,
//         args: arg,
//         functionName,
//       }),
//       chainId: PREFIX_TO_CHAIN[prefix]?.id,
//     }),
//     getGasPrice($wagmiConfig),
//   ])

//   return String(estimatedGas * gasPrice)
// }

// export const estimateTransactionFee = (account: string, decimals: number): Promise<string> => getTransitionFee(account, [''], decimals)

// export async function getTransitionFee(accountId: string, targetAddresses: Array<string>, decimal: number) {
//   return '0'
//   // const { cb, arg } = await getTransferParams(
//   //   targetAddresses.map(
//   //     () =>
//   //       ({
//   //         address: toDefaultAddress(KODADOT_DAO),
//   //         usd: 1,
//   //         token: 1,
//   //       }) as TargetAddress,
//   //   ),
//   //   decimal,
//   // )
//   // return estimate(accountId, cb, arg)
// }

export default exec
