export function getTokenIconBySymbol(token: string) {
  switch (token.toLowerCase()) {
    case 'dot':
      return '/token/dot.svg'
    case 'ksm':
      return '/token/ksm.svg'
    default:
      return '/token/ksm.svg'
  }
}
