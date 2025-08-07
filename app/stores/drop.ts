import type { MintingSession } from '@/components/drop/types'
import type { ToMassmintNFT } from '@/composables/drop/massmint/types'
import type { DropItem, DropStatus } from '@/types'

const DEFAULT_DROP: Omit<DropItem, 'chain'> = {
  id: '',
  collection: '',
  collectionName: '',
  collectionDescription: '',
  minted: 0,
  image: '',
  banner: '',
  name: '',
  content: '',
  alias: '',
  type: 'paid',
  disabled: 0,
  dropStartTime: undefined,
  isMintedOut: false,
  isFree: false,
  status: 'minting_live' as DropStatus,
  abi: undefined,
}

const DEFAULT_MINTING_SESSION: MintingSession = {
  txHash: '',
  items: [],
  isLoading: false,
  failed: false,
  status: TransactionStatus.Unknown,
}

export const useDropStore = defineStore('drop', () => {
  const { prefix } = usePrefix()

  const drop = ref<DropItem>({ ...DEFAULT_DROP, chain: prefix.value })
  const loading = ref(false)
  const isCapturingImage = ref(false)
  const previewItem = ref<GenerativePreviewItem>()
  const mintingSession = ref<MintingSession>({ ...DEFAULT_MINTING_SESSION })

  // massmint
  const amountToMint = ref(1)
  const toMintNFTs = ref<ToMassmintNFT[]>([]) // used to render each NFT and track their data, after a successfully preview generation the metadata is uplaoded
  const mintedNFTs = ref([])// used to show the final success modal with the minted NFTs and txHash if provided

  const resetMassmint = () => {
    loading.value = false
    toMintNFTs.value = []
    mintedNFTs.value = []
    mintingSession.value = { ...DEFAULT_MINTING_SESSION }
  }

  const reset = () => {
    isCapturingImage.value = false
    previewItem.value = undefined
    drop.value = { ...DEFAULT_DROP, chain: prefix.value }
    amountToMint.value = 1
    loading.value = false
    toMintNFTs.value = []
    mintedNFTs.value = []
    mintingSession.value = { ...DEFAULT_MINTING_SESSION }
  }

  return {
    loading,
    isCapturingImage,
    previewItem,
    drop,
    amountToMint,
    toMintNFTs,
    mintedNFTs,
    mintingSession,
    resetMassmint,
    reset,
  }
})
