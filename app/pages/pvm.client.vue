<script setup lang="ts">
// THIS PAGE WILL BE REMOVED
import type { Abi, Address } from 'viem'
import { useAccountStore } from '@/stores/account'
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from '@wagmi/vue'

const CONTRACT_DATA = {
  address: '0x2dd57f35a6bb4febdf6d5e5aec0a750a5f32ed92' as Address,
  abi: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'Transfer',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getAllTokens',
      outputs: [
        {
          internalType: 'uint256[]',
          name: '',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'getTokenDetails',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'getTokensByOwner',
      outputs: [
        {
          internalType: 'uint256[]',
          name: '',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'string',
          name: 'uri',
          type: 'string',
        },
      ],
      name: 'mint',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'name',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'ownerOf',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'tokenURI',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalSupply',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'transferFrom',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as Abi,
}

const { accounts } = storeToRefs(useAccountStore())
const evmAddress = computed(() => accounts.value.EVM.address)

const mintToAddress = ref('')
const mintTokenUri = ref('')
const transferFromAddress = ref('')
const transferToAddress = ref('')
const transferTokenId = ref('')
const queryTokenId = ref('')
const queryOwnerAddress = ref('')

watchEffect(() => {
  if (evmAddress.value) {
    transferFromAddress.value = evmAddress.value
  }
})

const { writeContract: writeContractFn, data: writeData, isPending: isWritePending, error: writeError } = useWriteContract()
const { data: txReceipt, isLoading: isTxLoading } = useWaitForTransactionReceipt({
  hash: writeData,
})

const { data: userBalance, refetch: refetchBalance } = useReadContract({
  address: CONTRACT_DATA.address,
  abi: CONTRACT_DATA.abi,
  functionName: 'balanceOf',
  args: [evmAddress],
})

const { data: contractName } = useReadContract({
  address: CONTRACT_DATA.address,
  abi: CONTRACT_DATA.abi,
  functionName: 'name',
})

const { data: contractSymbol } = useReadContract({
  address: CONTRACT_DATA.address,
  abi: CONTRACT_DATA.abi,
  functionName: 'symbol',
})

const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
  address: CONTRACT_DATA.address,
  abi: CONTRACT_DATA.abi,
  functionName: 'totalSupply',
})

const { data: tokenOwner, refetch: refetchTokenOwner } = useReadContract({
  address: CONTRACT_DATA.address,
  abi: CONTRACT_DATA.abi,
  functionName: 'ownerOf',
  args: computed(() => queryTokenId.value ? [BigInt(queryTokenId.value)] : undefined),
  query: {
    enabled: computed(() => !!queryTokenId.value),
  },
})

const { data: ownerBalance, refetch: refetchOwnerBalance } = useReadContract({
  address: CONTRACT_DATA.address,
  abi: CONTRACT_DATA.abi,
  functionName: 'balanceOf',
  args: computed(() => queryOwnerAddress.value ? [queryOwnerAddress.value as Address] : undefined),
  query: {
    enabled: computed(() => !!queryOwnerAddress.value),
  },
})

const { data: tokenUri, refetch: refetchTokenUri } = useReadContract({
  address: CONTRACT_DATA.address,
  abi: CONTRACT_DATA.abi,
  functionName: 'tokenURI',
  args: computed(() => queryTokenId.value ? [BigInt(queryTokenId.value)] : undefined),
  query: {
    enabled: computed(() => !!queryTokenId.value),
  },
})

const { data: tokenDetails, refetch: refetchTokenDetails } = useReadContract({
  address: CONTRACT_DATA.address,
  abi: CONTRACT_DATA.abi,
  functionName: 'getTokenDetails',
  args: computed(() => queryTokenId.value ? [BigInt(queryTokenId.value)] : undefined),
  query: {
    enabled: computed(() => !!queryTokenId.value),
  },
}) as { data: Ref<readonly [string, string] | undefined>, refetch: () => void }

const { data: allTokens, refetch: refetchAllTokens } = useReadContract({
  address: CONTRACT_DATA.address,
  abi: CONTRACT_DATA.abi,
  functionName: 'getAllTokens',
}) as { data: Ref<readonly bigint[] | undefined>, refetch: () => void }

const { data: userTokens, refetch: refetchUserTokens } = useReadContract({
  address: CONTRACT_DATA.address,
  abi: CONTRACT_DATA.abi,
  functionName: 'getTokensByOwner',
  args: [evmAddress],
}) as { data: Ref<readonly bigint[] | undefined>, refetch: () => void }

const { data: ownerTokens, refetch: refetchOwnerTokens } = useReadContract({
  address: CONTRACT_DATA.address,
  abi: CONTRACT_DATA.abi,
  functionName: 'getTokensByOwner',
  args: computed(() => queryOwnerAddress.value ? [queryOwnerAddress.value as Address] : undefined),
  query: {
    enabled: computed(() => !!queryOwnerAddress.value),
  },
}) as { data: Ref<readonly bigint[] | undefined>, refetch: () => void }

async function mintNFT() {
  if (!mintToAddress.value || !mintTokenUri.value)
    return

  writeContractFn({
    address: CONTRACT_DATA.address,
    abi: CONTRACT_DATA.abi,
    functionName: 'mint',
    args: [mintToAddress.value as Address, mintTokenUri.value],
  })
}

async function transferNFT() {
  if (!transferFromAddress.value || !transferToAddress.value || !transferTokenId.value)
    return

  writeContractFn({
    address: CONTRACT_DATA.address,
    abi: CONTRACT_DATA.abi,
    functionName: 'transferFrom',
    args: [
      transferFromAddress.value as Address,
      transferToAddress.value as Address,
      BigInt(transferTokenId.value),
    ],
  })
}

function mintToSelf() {
  mintToAddress.value = evmAddress.value
  if (mintTokenUri.value) {
    mintNFT()
  }
}

function refreshData() {
  refetchBalance()
  refetchTotalSupply()
  refetchAllTokens()
  refetchUserTokens()
  if (queryTokenId.value) {
    refetchTokenOwner()
    refetchTokenUri()
    refetchTokenDetails()
  }
  if (queryOwnerAddress.value) {
    refetchOwnerBalance()
    refetchOwnerTokens()
  }
}

watchEffect(() => {
  if (txReceipt.value) {
    refreshData()
  }
})

watchEffect(() => {
  if (writeError.value) {
    console.error('Transaction error:', writeError.value)
  }
})
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          PolkaVM - NFT Contract Playground
        </h1>
        <UBadge color="neutral" variant="soft" size="lg">
          {{ CONTRACT_DATA.address }}
        </UBadge>
      </div>

      <!-- Wallet Connection Check -->
      <UAlert
        v-if="!evmAddress"
        icon="i-heroicons-exclamation-triangle"
        color="warning"
        title="Wallet Not Connected"
        description="Please connect your EVM wallet first to interact with the NFT contract."
      />

      <div v-else class="space-y-8">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-info-500" />
              <h2 class="text-xl font-semibold">
                Contract Information
              </h2>
            </div>
          </template>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="text-center">
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                Name
              </p>
              <p class="font-semibold text-lg">
                {{ contractName || 'Loading...' }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                Symbol
              </p>
              <p class="font-semibold text-lg">
                {{ contractSymbol || 'Loading...' }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                Total Supply
              </p>
              <p class="font-semibold text-lg">
                {{ totalSupply?.toString() || 'Loading...' }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                Your Balance
              </p>
              <p class="font-semibold text-lg text-success-500">
                {{ userBalance?.toString() || 'Loading...' }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-user-circle" class="w-5 h-5 text-secondary-500" />
              <h2 class="text-xl font-semibold">
                Your Account
              </h2>
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                Connected Address:
              </p>
              <UInput
                :model-value="evmAddress"
                readonly
                class="font-mono"
                icon="i-heroicons-clipboard-document"
              />
            </div>

            <div v-if="userTokens && userTokens.length > 0">
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                Your NFTs:
              </p>
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="tokenId in userTokens"
                  :key="tokenId.toString()"
                  color="success"
                  variant="soft"
                >
                  #{{ tokenId.toString() }}
                </UBadge>
              </div>
            </div>
          </div>
        </UCard>

        <UCard v-if="allTokens && allTokens.length > 0">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5 text-info-500" />
              <h2 class="text-xl font-semibold">
                All Minted NFTs
              </h2>
            </div>
          </template>

          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="tokenId in allTokens"
              :key="tokenId.toString()"
              color="neutral"
              variant="soft"
            >
              #{{ tokenId.toString() }}
            </UBadge>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-plus-circle" class="w-5 h-5 text-primary-500" />
              <h2 class="text-xl font-semibold">
                Mint NFT
              </h2>
            </div>
          </template>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mint to Address
              </label>
              <UInput
                v-model="mintToAddress"
                placeholder="0x..."
                icon="i-heroicons-wallet"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Token URI (IPFS Metadata)
              </label>
              <UInput
                v-model="mintTokenUri"
                placeholder="ipfs://QmYourHashHere"
                icon="i-heroicons-globe-alt"
              />
            </div>

            <div class="flex gap-3">
              <UButton
                :disabled="!mintToAddress || !mintTokenUri || isWritePending"
                :loading="isWritePending"
                color="primary"
                icon="i-heroicons-plus"
                @click="mintNFT"
              >
                {{ isWritePending ? 'Minting...' : 'Mint NFT' }}
              </UButton>

              <UButton
                :disabled="isWritePending || !mintTokenUri"
                :loading="isWritePending"
                color="success"
                variant="outline"
                icon="i-heroicons-user"
                @click="mintToSelf"
              >
                Mint to Self
              </UButton>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-arrow-right-circle" class="w-5 h-5 text-warning-500" />
              <h2 class="text-xl font-semibold">
                Transfer NFT
              </h2>
            </div>
          </template>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                From Address (Your Address)
              </label>
              <UInput
                v-model="transferFromAddress"
                disabled
                icon="i-heroicons-user"
                class="opacity-75"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                To Address
              </label>
              <UInput
                v-model="transferToAddress"
                placeholder="0x..."
                icon="i-heroicons-wallet"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Token ID
              </label>
              <UInput
                v-model="transferTokenId"
                type="number"
                placeholder="1"
                icon="i-heroicons-hashtag"
              />
            </div>

            <UButton
              :disabled="!transferFromAddress || !transferToAddress || !transferTokenId || isWritePending"
              :loading="isWritePending"
              color="warning"
              icon="i-heroicons-arrow-right"
              @click="transferNFT"
            >
              {{ isWritePending ? 'Transferring...' : 'Transfer NFT' }}
            </UButton>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-neutral-500" />
              <h2 class="text-xl font-semibold">
                Query Contract
              </h2>
            </div>
          </template>

          <div class="space-y-6">
            <div class="space-y-3">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search by NFT ID
                </label>
                <UInput
                  v-model="queryTokenId"
                  type="number"
                  placeholder="1"
                  icon="i-heroicons-hashtag"
                />
              </div>

              <div v-if="queryTokenId">
                <UAlert
                  icon="i-heroicons-information-circle"
                  color="info"
                  variant="soft"
                  :title="`Token #${queryTokenId} Information`"
                >
                  <template #description>
                    <div class="space-y-2 mt-2">
                      <div>
                        <span class="font-medium">Owner:</span>
                        <code class="ml-2 text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">{{ tokenOwner || 'Token not found' }}</code>
                      </div>
                      <div>
                        <span class="font-medium">Token URI:</span>
                        <code class="ml-2 text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded break-all">{{ tokenUri || 'No URI' }}</code>
                      </div>
                      <div v-if="tokenDetails">
                        <span class="font-medium">Details (Owner, URI):</span>
                        <div class="ml-2 text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded mt-1">
                          <div>
                            Owner: {{ tokenDetails[0] || 'Unknown' }}
                          </div>
                          <div class="break-all">
                            URI: {{ tokenDetails[1] || 'No URI' }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </UAlert>
              </div>
            </div>

            <div class="space-y-3">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search by Owner Address
                </label>
                <UInput
                  v-model="queryOwnerAddress"
                  placeholder="0x..."
                  icon="i-heroicons-wallet"
                />
              </div>

              <div v-if="queryOwnerAddress">
                <UAlert
                  icon="i-heroicons-wallet"
                  color="success"
                  variant="soft"
                  :title="`Balance: ${ownerBalance?.toString() || '0'} NFTs`"
                >
                  <template #description>
                    <div v-if="ownerTokens && ownerTokens.length > 0" class="mt-2">
                      <span class="font-medium">Owned Token IDs:</span>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <UBadge
                          v-for="tokenId in ownerTokens"
                          :key="tokenId.toString()"
                          color="success"
                          variant="soft"
                          size="sm"
                        >
                          #{{ tokenId.toString() }}
                        </UBadge>
                      </div>
                    </div>
                  </template>
                </UAlert>
              </div>
            </div>
          </div>
        </UCard>

        <UCard v-if="writeData || writeError">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-clock" class="w-5 h-5 text-info-500" />
              <h2 class="text-xl font-semibold">
                Transaction Status
              </h2>
            </div>
          </template>

          <div class="space-y-4">
            <div v-if="writeData">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transaction Hash
                </label>
                <UInput :model-value="writeData" readonly class="font-mono text-xs" />
              </div>

              <div v-if="isTxLoading" class="mt-4">
                <UAlert
                  icon="i-heroicons-clock"
                  color="info"
                  title="Waiting for confirmation..."
                  description="Your transaction is being processed on the blockchain."
                />
              </div>

              <div v-if="txReceipt" class="mt-4">
                <UAlert
                  icon="i-heroicons-check-circle"
                  color="success"
                  title="Transaction confirmed!"
                  :description="`Block: ${txReceipt.blockNumber?.toString()}`"
                />
              </div>
            </div>

            <div v-if="writeError">
              <UAlert
                icon="i-heroicons-exclamation-triangle"
                color="error"
                title="Transaction failed"
                :description="writeError.message"
              />
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-code-bracket" class="w-5 h-5 text-neutral-500" />
              <h2 class="text-xl font-semibold">
                Contract ABI
              </h2>
            </div>
          </template>

          <UAccordion
            :items="[
              {
                label: 'View Contract ABI',
                icon: 'i-heroicons-eye',
                defaultOpen: false,
                slot: 'abi-content',
              },
            ]"
          >
            <template #abi-content>
              <div class="mt-4">
                <UAlert
                  icon="i-heroicons-information-circle"
                  color="info"
                  variant="soft"
                  title="Contract ABI"
                  description="Application Binary Interface - defines how to interact with the smart contract"
                />
                <div class="mt-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 overflow-auto">
                  <pre class="text-xs font-mono whitespace-pre-wrap break-all">{{ JSON.stringify(CONTRACT_DATA.abi, null, 2) }}</pre>
                </div>
              </div>
            </template>
          </UAccordion>
        </UCard>

        <div class="flex justify-center">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-heroicons-arrow-path"
            @click="refreshData"
          >
            Refresh Data
          </UButton>
        </div>
      </div>
    </div>
  </UContainer>
</template>
