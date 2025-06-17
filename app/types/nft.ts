interface BaseInteraction {
  id: string
  interaction: string
  meta: string
}

export interface Interaction extends BaseInteraction {
  blockNumber: string | null
  caller: string
  currentOwner: string
  timestamp: string
}
