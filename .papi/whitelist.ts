import type {
    AhkWhitelistEntry,
    AhpWhitelistEntry,
    DotWhitelistEntry,
    KsmWhitelistEntry
} from "../app/descriptors";

// TODO: Add more whitelists for other chains
const assetHubWhitelist: AhkWhitelistEntry[] | AhpWhitelistEntry[] = [
    "query.Nfts.*",
]

const chainWhitelist: DotWhitelistEntry[] | KsmWhitelistEntry[] = [
    "query.System.Account"
]

export const whitelist = [...assetHubWhitelist, ...chainWhitelist]
