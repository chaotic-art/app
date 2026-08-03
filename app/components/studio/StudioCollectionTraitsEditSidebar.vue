<script setup lang="ts">
import { useNftPallets } from '~/composables/onchain/useNftPallets'
import { fetchTokenMetadata } from '~/composables/useToken'
import { pinJson } from '~/services/storage'
import { sanitizeIpfsUrl } from '~/utils/ipfs'

export interface NftTraitsEditRow {
  id: string
  sn: number
  image?: string | null
  name: string
  properties: Array<{ trait: string, value: string }>
}

const props = defineProps<{
  collectionId: string
  nft: NftTraitsEditRow | null
}>()

const open = defineModel<boolean>('open', { required: true })

const editProperties = ref<Array<{ trait: string, value: string }>>([])
const submitting = ref(false)

watch(() => props.nft, (nft) => {
  if (nft) {
    editProperties.value = nft.properties.length
      ? nft.properties.map(p => ({ trait: p.trait, value: p.value }))
      : [{ trait: '', value: '' }]
  }
  else {
    editProperties.value = []
  }
}, { immediate: true })

const { currentChain } = useChain()
const { getItemMetadataUri, updateItemAttributes } = useNftPallets()

const validEditProperties = computed(() =>
  editProperties.value
    .filter(p => p.trait.trim() && p.value.trim())
    .map(p => ({ trait: p.trait.trim(), value: p.value.trim() })),
)

function addEditProperty() {
  editProperties.value = [...editProperties.value, { trait: '', value: '' }]
}

function removeEditProperty(index: number) {
  editProperties.value = editProperties.value.filter((_, i) => i !== index)
}

function close() {
  open.value = false
}

async function confirmEdit() {
  const row = props.nft
  if (!row) {
    return
  }
  submitting.value = true
  try {
    const chain = currentChain.value
    const collectionId = Number(props.collectionId)
    const itemId = row.sn
    const properties = validEditProperties.value
    const attributesForMeta = properties.map(p => ({ trait_type: p.trait, value: p.value }))

    const currentUri = await getItemMetadataUri(chain, collectionId, itemId)
    const currentMeta = currentUri ? await fetchTokenMetadata(currentUri) : null

    const newMetadata = currentMeta
      ? { ...currentMeta, attributes: attributesForMeta }
      : {
          name: row.name,
          description: '',
          image: row.image ?? undefined,
          attributes: attributesForMeta,
        }

    const cid = await pinJson(newMetadata)
    const newMetadataUri = `ipfs://${cid}`

    await updateItemAttributes({
      chain,
      collectionId,
      itemId,
      properties,
      metadataUri: newMetadataUri,
    })
    close()
  }
  catch (e) {
    console.error('Update attributes failed:', e)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <USlideover
    v-model:open="open"
    side="right"
    :title="nft ? `Edit traits #${nft.sn}` : ''"
  >
    <template #body>
      <div v-if="nft" class="p-6 h-full overflow-y-auto">
        <div class="mx-auto w-full max-w-lg space-y-6">
          <div class="space-y-3">
            <div class="text-sm font-medium text-muted">
              Name
            </div>
            <div class="text-foreground">
              {{ nft.name }}
            </div>
          </div>
          <div class="space-y-3">
            <div class="text-sm font-medium text-muted">
              Image
            </div>
            <div class="flex justify-start">
              <img
                v-if="nft.image"
                :src="sanitizeIpfsUrl(nft.image)"
                :alt="nft.name"
                class="w-32 h-32 aspect-square rounded-lg object-cover border border-border bg-muted"
              >
              <div v-else class="w-32 h-32 aspect-square rounded-lg border border-border bg-muted flex items-center justify-center">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-muted" />
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="text-sm font-medium text-muted">
              Properties
            </div>
            <div class="space-y-3">
              <div
                v-for="(p, index) in editProperties"
                :key="index"
                class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end"
              >
                <UFormField :label="index === 0 ? 'Trait' : ''" :name="`edit.${index}.trait`">
                  <UInput
                    v-model="p.trait"
                    placeholder="Trait type"
                    class="w-full"
                  />
                </UFormField>
                <UFormField :label="index === 0 ? 'Value' : ''" :name="`edit.${index}.value`">
                  <UInput
                    v-model="p.value"
                    placeholder="Value"
                    class="w-full"
                  />
                </UFormField>
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-heroicons-x-mark"
                  class="mb-0"
                  :aria-label="`Remove property ${index + 1}`"
                  @click="removeEditProperty(index)"
                />
              </div>
              <UButton
                variant="ghost"
                size="sm"
                icon="i-heroicons-plus"
                @click="addEditProperty"
              >
                Add property
              </UButton>
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <UButton
              variant="outline"
              class="flex-1"
              :disabled="submitting"
              @click="close"
            >
              Cancel
            </UButton>
            <UButton
              class="flex-1"
              :disabled="submitting"
              :loading="submitting"
              @click="confirmEdit"
            >
              Confirm
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
