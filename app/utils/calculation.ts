export function calculateUsdFromToken(amount: number, price: number): number {
  return Math.floor(amount * price * 100) / 100
}

export function calculateExactUsdFromToken(
  token: number,
  price: number,
): number {
  return Number((token * price).toFixed(1))
}
