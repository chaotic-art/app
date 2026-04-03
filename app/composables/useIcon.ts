import type { Chain } from '~/types'

export function useIcon() {
  const { isDarkMode } = useTheme()

  const getChainIcon = (chain: Chain | null): string | null => {
    switch (chain) {
      case 'ahp':
        return isDarkMode.value ? '/chain/ahp_dark.svg' : '/chain/ahp.svg'
      case 'ahk':
        return isDarkMode.value ? '/chain/ahk_dark.svg' : '/chain/ahk.svg'
      default:
        return null
    }
  }

  return {
    getChainIcon,
  }
}
