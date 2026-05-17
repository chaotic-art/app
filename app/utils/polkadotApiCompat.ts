/* eslint-disable antfu/no-import-dist, antfu/no-import-node-modules-by-path -- The package root is aliased to this shim for ParaPort's v1 imports, so this file must import the real package entry directly. */
import { Binary as PapiBinary } from '../../node_modules/polkadot-api/dist/src/index.js'

export * from '../../node_modules/polkadot-api/dist/src/index.js'

function withBinaryMethods(bytes: Uint8Array) {
  return Object.assign(bytes, {
    asBytes: () => bytes,
    asHex: () => PapiBinary.toHex(bytes),
    asText: () => PapiBinary.toText(bytes),
  })
}

export const Binary = {
  ...PapiBinary,
  fromHex: (hex: Parameters<typeof PapiBinary.fromHex>[0]) => withBinaryMethods(PapiBinary.fromHex(hex)),
  fromText: (text: string) => withBinaryMethods(PapiBinary.fromText(text)),
}

export const FixedSizeBinary = {
  fromHex: (hex: Parameters<typeof PapiBinary.fromHex>[0]) => ({
    asBytes: () => PapiBinary.fromHex(hex),
    asHex: () => hex,
    toString: () => hex,
    valueOf: () => hex,
  }),
  fromAccountId32: (accountId: Uint8Array | { asBytes: () => Uint8Array }) => {
    const bytes = accountId instanceof Uint8Array ? accountId : accountId.asBytes()
    const hex = PapiBinary.toHex(bytes)
    return {
      asBytes: () => bytes,
      asHex: () => hex,
      toString: () => hex,
      valueOf: () => hex,
    }
  },
}
