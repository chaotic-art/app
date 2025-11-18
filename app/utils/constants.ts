export const ksmHubDenyList = [
  'EZwaNLfEwAMYcEdbp7uKYFCjnsn43S85pm6BumT5UwvZQvB', // SubstraTee minter, broken IPFS
  'Eipd9P7j9XC7voYxYgAoyE6wwt8BmpLDNC89RAU2cf6Qtrk', // No metadata
]

export const dotHubDenyList = [
  '128qRiVjxU3TuT37tg7AX99zwqfPtj2t4nDKUv9Dvi5wzxuF', // RMRK test
  '155HWw3J9jyYphMm5is4vp9Bzj7ZRRd6HEzCPdWd8cq97KfT', // Very old unreacheable IPFS
  '16aWyT5Xa2wogTARQxk8LnQqi5nquy3Xrc4YcgJrmjEWrduq', // Market Manipulation
]

export const URLS = {
  appDomain: 'https://chaotic.art',
  services: {
    price: 'https://price.chaotic.art',
    genart: 'https://genart.chaotic.art',
    profile: 'https://profile.chaotic.art',
    bucket: 'https://bucket.chaotic.art/',
    dyndata: 'https://dyndata.chaotic.art',
    oda: 'https://oda.chaotic.art',
    playground: 'https://playground.chaotic.art',
    playground_bucket: 'https://playground-bucket.chaotic.art',
    cors_proxy: 'https://cors-proxy.chaotic.art',

    // TODO: migrate to chaotic
    nftStorage: 'https://ipos.kodadot.workers.dev/',
  },
  graphql: {
    ahk: 'https://ahk.gql.api.kodadot.xyz/',
    ahp: 'https://ahp.gql.api.kodadot.xyz/',
  },
  providers: {
    coingecko: 'https://api.coingecko.com/api/v3',
    ramp: 'https://ramp.network/buy/',
    pinata: 'https://api.pinata.cloud/',
    cf_images: 'https://imagedelivery.net/Im3azVCMHMp2rDcvZOACIg/',
  },
}
