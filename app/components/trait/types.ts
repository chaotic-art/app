export interface SelectedTrait {
  traitType: string
  value: string
}

export enum ChartType {
  BAR = 'BAR',
  DOUGHNUT = 'DOUGHNUT',
}

export interface TraitValueRow {
  traitType: string
  value: string
  count: number
  rarity: number
}
