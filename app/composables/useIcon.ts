import type { Prefix } from '@kodadot1/static'

export function useIcon() {
  const { isDarkMode } = useTheme()

  const getChainIcon = (prefix: Prefix | null): string | null => {
    switch (prefix) {
      case 'ahp':
        return isDarkMode.value ? '/chain/ahp_dark.svg' : '/chain/ahp.svg'
      case 'ahk':
        return isDarkMode.value ? '/chain/ahk_dark.svg' : '/chain/ahk.svg'
      case 'base':
        return isDarkMode.value ? '/chain/base_dark.svg' : '/chain/base.svg'
      default:
        return null
    }
  }

  return {
    getChainIcon,
  }
}
