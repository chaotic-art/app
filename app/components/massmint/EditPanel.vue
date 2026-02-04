<script setup lang="ts">
import type { NFT } from './types'

const props = defineProps<{
  nft?: NFT
  open: boolean
}>()

const emit = defineEmits(['close', 'save'])

const { chainSymbol } = useChain()

const internalNfT = ref<Partial<NFT>>({})
const dirty = ref({ name: false, description: false, price: false, attributes: false })

function createField(fieldName: keyof NFT, defaultValue: string | unknown = '') {
  return computed({
    get: () =>
      dirty.value[fieldName as keyof typeof dirty.value]
        ? internalNfT.value[fieldName]
        : (props.nft?.[fieldName] as any) || defaultValue,
    set: (value) => {
      internalNfT.value = {
        ...internalNfT.value,
        [fieldName]:
          fieldName === 'price' && value !== '' ? Number(value) : value,
      }
      ;(dirty.value as any)[fieldName] = true
    },
  })
}

const name = createField('name')
const description = createField('description')
const price = createField('price')
const attributes = createField('attributes', [])

const panelOpen = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) {
      closePanel()
    }
  },
})

function closePanel() {
  internalNfT.value = {}
  dirty.value = { name: false, description: false, price: false, attributes: false }
  emit('close')
}

function save() {
  const nft = {
    ...props.nft,
    ...internalNfT.value,
  }
  emit('save', nft)
  closePanel()
}

function addAttribute() {
  const current = attributes.value || []
  attributes.value = [...current, { trait_type: '', value: '' }]
}

function removeAttribute(index: number) {
  const current = (attributes.value as any[]) || []
  attributes.value = current.filter((_, i) => i !== index)
}
</script>

<template>
  <USlideover
    v-model:open="panelOpen"
    side="right"
    :title="`Edit NFT #${nft?.id ?? ''}`"
  >
    <template #body>
      <div class="p-6 h-full overflow-y-auto">
        <div class="mx-auto w-full max-w-3xl space-y-8">
          <!-- Preview -->
          <div class="flex justify-start">
            <img
              :src="nft?.imageUrl"
              :alt="nft?.name"
              class="rounded-md w-[200px] h-[200px]"
            >
          </div>

          <!-- Name -->
          <div class="space-y-2">
            <div class="text-lg font-semibold">
              Name
            </div>
            <UFormField name="name">
              <UInput
                v-model="name"
                placeholder="* Required"
                required
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <div class="text-lg font-semibold">
              Description
            </div>
            <UFormField name="description">
              <UTextarea
                v-model="description"
                :rows="6"
                :maxlength="500"
                autoresize
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Attributes -->
          <div class="space-y-3">
            <div class="text-lg font-semibold">
              Attributes
            </div>
            <div class="space-y-3">
              <div
                v-for="(attribute, index) in attributes"
                :key="index"
                class="grid grid-cols-1 md:grid-cols-2 gap-3 items-end"
              >
                <UFormField :label="index === 0 ? 'Trait' : ''" :name="`attributes.${index}.trait_type`">
                  <UInput
                    v-model="attribute.trait_type"
                    class="w-full"
                  />
                </UFormField>
                <div class="flex gap-3 items-end">
                  <UFormField :label="index === 0 ? 'Value' : ''" :name="`attributes.${index}.value`" class="flex-1">
                    <UInput
                      v-model="attribute.value"
                      class="w-full"
                    />
                  </UFormField>
                  <UButton
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    icon="i-heroicons-x-mark"
                    class="mb-0"
                    @click="removeAttribute(Number(index))"
                  />
                </div>
              </div>

              <div>
                <UButton
                  variant="ghost"
                  size="sm"
                  icon="i-heroicons-plus"
                  @click="addAttribute"
                >
                  Add Attribute
                </UButton>
              </div>
            </div>
          </div>

          <!-- Price -->
          <div class="space-y-2">
            <div class="text-lg font-semibold">
              Price
            </div>
            <UFormField name="price">
              <div class="relative w-full">
                <UInput
                  v-model.number="price"
                  type="number"
                  placeholder="0"
                  step="any"
                  min="0"
                  class="w-full pr-16"
                />
                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-foreground/70">
                  {{ chainSymbol }}
                </div>
              </div>
            </UFormField>
          </div>

          <!-- Save -->
          <div class="pt-4">
            <UButton
              class="w-full"
              :disabled="!name"
              @click="save"
            >
              Save
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
