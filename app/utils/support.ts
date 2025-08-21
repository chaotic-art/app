export const SUPPORT_ADDRESS = '15CoYMEnJhhWHvdEPXDuTBnZKXwrJzMQdcMwcHGsVx5kXYvW'

export const BASE_FEE = 0.5 // 50 cents
export const SUPPORT_FEE_PERCENT = 0.03 // percent / 100

export function getPercentSupportFee(price: number | string) {
  return Math.floor(Number(price) * SUPPORT_FEE_PERCENT)
}
