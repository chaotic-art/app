export const crypto = typeof globalThis === 'object' && 'crypto' in globalThis
  ? (globalThis as any).crypto
  : undefined as any
