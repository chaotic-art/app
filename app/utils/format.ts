export function shortenAddress(address: string): string {
  if (!address || address.length < 10)
    return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}
