interface MappingOptions {
  distinguishBuyAndSell?: boolean
}

const defaultMappingOptions: MappingOptions = {
  distinguishBuyAndSell: false,
}

export function getInteractionColor(interaction: string, { distinguishBuyAndSell }: MappingOptions = defaultMappingOptions) {
  const sellColor = 'bg-pink-500 dark:bg-pink-700'
  const buyColor = 'bg-blue-500 dark:bg-blue-700'
  return {
    [Interaction.MINT]: 'bg-yellow-500 dark:bg-yellow-700',
    [Interaction.LIST]: 'bg-blue-500 dark:bg-blue-700',
    [Interaction.BUY]: distinguishBuyAndSell ? buyColor : sellColor,
    [Interaction.SEND]: 'bg-background dark:bg-background text-accent-foreground!',
    SELL: sellColor,
  }[interaction]
}

export function interactionNameMap({ distinguishBuyAndSell }: MappingOptions = defaultMappingOptions) {
  const map = {
    LIST: 'List',
    MINTNFT: 'Mint',
    MINT: 'Mint',
    SEND: 'Transfer',
    Offer: 'Offer',
  }

  if (distinguishBuyAndSell) {
    return { ...map, BUY: 'Buy', SELL: 'Sale' }
  }

  return { ...map, BUY: 'Sale' }
}
