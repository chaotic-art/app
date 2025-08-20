export function calculateUsdFromToken(amount: number, price: number): number {
  return Math.floor(amount * price * 100) / 100
}

export function calculateExactUsdFromToken(
  token: number,
  price: number,
): number {
  return Number((token * price).toFixed(1))
}

export function tokenToUsd(amount: number, tokenDecimals: number, tokenSymbol: string) {
  const { getCurrentTokenValue } = useFiatStore()
  const value = calculateUsdFromToken(
    Number(amount) * 10 ** -tokenDecimals,
    Number(getCurrentTokenValue(tokenSymbol as Token)),
  )
  return typeof value === 'number' && value >= 0 ? `$${value}` : ''
}
