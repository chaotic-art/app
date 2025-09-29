import type { AllEventsByProfileData } from '~/graphql/queries/profiles'

export type EventInteraction = AllEventsByProfileData['events'][number]

export const Interaction = {
  ACCEPT: 'ACCEPT',
  BASE: 'BASE',
  EQUIP: 'EQUIP',
  EQUIPPABLE: 'EQUIPPABLE',
  LOCK: 'LOCK',
  RESADD: 'RESADD',
  SETPROPERTY: 'SETPROPERTY',
  SETPRIORITY: 'SETPRIORITY',
  THEMEADD: 'THEMEADD',
  CREATE: 'CREATE',
  MINT: 'MINT',
  MINTNFT: 'MINTNFT',
  LIST: 'LIST',
  UNLIST: 'UNLIST',
  BUY: 'BUY',
  SEND: 'SEND',
  CONSUME: 'CONSUME',
  CHANGEISSUER: 'CHANGEISSUER',
  EMOTE: 'EMOTE',
  BURN: 'BURN',
  DESTROY: 'DESTROY',
  AIRDROP: 'AIRDROP',
} as const
