<script setup lang="ts">
import type { OdaChain, OnchainCollection } from '~/services/oda'
import { getAssetHubChain } from '~/utils/chain'
import { getSubscanAccountUrl } from '~/utils/format/address'
import { sanitizeIpfsUrl, toOriginalContentUrl } from '~/utils/ipfs'
import { unlimited } from '~/utils/math'

const props = defineProps<{
  collection: OnchainCollection | null
  collectionId: string
  /** Route-facing chain used for links and ODA-backed reads. */
  chain: OdaChain
  drop?: {
    /** Optional override for owner (e.g. drops creator). Falls back to collection.owner. */
    creator?: string
    /** Optional drop alias for "View Drop" button. */
    alias?: string
  }
  actions?: {
    /** Show delete collection button. */
    canDelete?: boolean
    /** Current user is collection owner (enables delete). */
    isOwner?: boolean
  }
}>()

const emit = defineEmits<{
  delete: []
}>()

const displayName = computed(
  () => props.collection?.metadata?.name || `Collection #${props.collectionId}`,
)

const bannerUrl = computed(() => {
  const raw = props.collection?.metadata?.banner || props.collection?.metadata?.image
  return raw ? toOriginalContentUrl(sanitizeIpfsUrl(raw)) : ''
})

const assetHubChain = computed(() => getAssetHubChain(props.chain))

const ownerFromProps = computed(
  () => props.drop?.creator || props.collection?.owner,
)

// Fallback: when ODA/drops fail, fetch collection owner from chain so creator + Subscan always show
const ownerFromChain = ref<string | null>(null)
onMounted(async () => {
  if (ownerFromProps.value || !props.collectionId || !assetHubChain.value)
    return
  const collectionId = Number(props.collectionId)
  if (Number.isNaN(collectionId))
    return
  try {
    const { $sdk } = useNuxtApp()
    const api = $sdk(assetHubChain.value).api
    const collection = await api.query.Nfts.Collection.getValue(collectionId)
    if (collection?.owner) {
      ownerFromChain.value = collection.owner.toString()
    }
  }
  catch {
    // ignore
  }
})

const ownerAddress = computed(
  () => ownerFromProps.value || ownerFromChain.value,
)
</script>

<template>
  <div class="w-full">
    <!-- Banner Section -->
    <div class="relative w-full min-h-[340px] flex flex-col justify-end rounded-xl overflow-hidden">
      <div
        class="absolute inset-0 w-full h-full bg-muted"
        :style="bannerUrl ? {
          backgroundImage: `url('${bannerUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}"
      />

      <div class="relative flex items-center px-8 py-8 z-10">
        <div class="flex flex-col items-center">
          <div class="w-36 h-36 rounded-xl overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-4 border-white dark:border-gray-900 shadow-xl">
            <img
              v-if="collection?.metadata?.image"
              :src="sanitizeIpfsUrl(collection.metadata.image)"
              :alt="collection.metadata.name || 'Collection'"
              class="w-full h-full object-cover"
            >
            <div
              v-else
              class="w-full h-full flex items-center justify-center"
            >
              <UIcon name="i-heroicons-photo" class="w-12 h-12 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full">
      <div class="flex justify-between flex-col md:flex-row gap-12">
        <div class="flex flex-col flex-1">
          <div class="my-4">
            <div class="flex items-center justify-between mb-2">
              <div class="text-2xl font-bold">
                {{ displayName }}
              </div>
              <UButton
                v-if="props.actions?.canDelete && props.actions?.isOwner"
                color="error"
                variant="outline"
                icon="i-heroicons-trash"
                @click="emit('delete')"
              >
                Delete Collection
              </UButton>
            </div>
            <div v-if="ownerAddress" class="flex items-center gap-1 text-muted-foreground">
              <UserInfo :avatar-size="26" :address="ownerAddress" class="min-w-0" />
              <UButton
                v-if="assetHubChain"
                :to="getSubscanAccountUrl(ownerAddress, assetHubChain)"
                target="_blank"
                variant="outline"
              >
                Subscan
              </UButton>
              <UButton
                v-if="props.drop?.alias"
                :to="`/${chain}/drops/${props.drop.alias}`"
                icon="i-heroicons-sparkles"
                variant="outline"
              >
                View Drop: {{ collection?.metadata?.name }}
              </UButton>
            </div>
          </div>

          <!-- Description -->
          <MarkdownPreview
            v-if="collection?.metadata?.description"
            :source="collection.metadata.description"
          />
        </div>

        <!-- Quick Stats -->
        <div class="pt-4 w-auto md:w-60 space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500 dark:text-gray-400">Minted</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ collection?.claimed || 0 }} / {{ unlimited(collection?.supply) ? '∞' : collection?.supply || 0 }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500 dark:text-gray-400">Floor Price</span>
            <span class="font-medium text-gray-900 dark:text-white">
              <Money v-if="collection?.floor" inline :value="collection.floor" />
              <span v-else class="text-gray-400 dark:text-gray-500">–</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
