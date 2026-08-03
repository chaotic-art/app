export function calculateUsdFromToken(amount: number, price: number): number {
  return Math.floor(amount * price * 100) / 100
}

export function calculateTokenFromUsd(usd: number, tokenPrice: number): number {
  return Math.ceil((usd / tokenPrice) * 10000) / 10000
}

export function calculateExactUsdFromToken(
  token: number,
  price: number,
): number {
  return Number((token * price).toFixed(1))
}

export function amountToNative(amount: number, tokenDecimals: number): number {
  return Number(amount) * 10 ** tokenDecimals
}

export function nativeToAmount(native: number, tokenDecimals: number): number {
  return Number((native / 10 ** tokenDecimals))
}

export function tokenToUsd(amount: number, tokenDecimals: number, tokenSymbol: string) {
  const value = tokenToUsdValue(amount, tokenDecimals, tokenSymbol)
  return typeof value === 'number' && value >= 0 ? `$${value}` : ''
}

export function tokenToUsdValue(amount: number, tokenDecimals: number, tokenSymbol: string): number {
  const { getCurrentTokenValue } = useFiatStore()
  return calculateUsdFromToken(
    Number(amount) * 10 ** -tokenDecimals,
    Number(getCurrentTokenValue(tokenSymbol as Token)),
  )
}
