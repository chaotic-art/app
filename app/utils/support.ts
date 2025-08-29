export const CHAOTIC_MINTER = '1BoTLfRK1zi2nFKAwTZJtTFoTKwXTs6N1x2FFGE1jbAo2Hu'

export const SUPPORT_FEE_PERCENT = 0.03 // percent / 100

export function getPercentSupportFee(price: number | string) {
  return Math.floor(Number(price) * SUPPORT_FEE_PERCENT)
}
