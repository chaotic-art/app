import { createConsola } from 'consola'

export const createLogger = (scope?: string) => createConsola({ defaults: { tag: scope } })
