<script setup lang="ts">
import type { DashboardCollection } from '~/composables/dashboard/useCreatorDashboard'
import { sanitizeIpfsUrl } from '~/utils/ipfs'

const props = defineProps<{
  collection: DashboardCollection
}>()

const route = useRoute()
const router = useRouter()
const isMock = computed(() => route.query.mock === 'true')

const bannerUrl = computed(() => {
  const img = props.collection.metadata?.banner || props.collection.metadata?.image
  return img ? sanitizeIpfsUrl(img) : ''
})

const logoUrl = computed(() => {
  const img = props.collection.metadata?.image
  return img ? sanitizeIpfsUrl(img) : ''
})

function handleView() {
  router.push({
    path: `/${props.collection.chain}/collection/${props.collection.id}`,
    query: isMock.value ? { mock: 'true' } : {},
  })
}

function handleManage() {
  const mockQuery = isMock.value ? '?mock=true' : ''
  router.push(`/${props.collection.chain}/studio/${props.collection.id}${mockQuery}`)
}
</script>

<template>
  <div class="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
    <!-- Banner -->
    <div class="relative h-32 bg-muted overflow-hidden">
      <img
        v-if="bannerUrl"
        :src="bannerUrl"
        :alt="collection.metadata?.name"
        class="w-full h-full object-cover"
      >
      <div v-else class="w-full h-full bg-linear-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-700" />

      <!-- Logo overlay -->
      <div class="absolute -bottom-6 left-4">
        <div class="w-12 h-12 rounded-lg overflow-hidden border-2 border-background bg-muted shadow">
          <img
            v-if="logoUrl"
            :src="logoUrl"
            :alt="collection.metadata?.name"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-heroicons-photo" class="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>

    <div class="pt-8 p-4 space-y-3">
      <h3 class="font-semibold text-sm truncate">
        {{ collection.metadata?.name || `Collection #${collection.id}` }}
      </h3>

      <div class="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{{ collection.claimed || 0 }} items</span>
        <span v-if="collection.floor">
          Floor: <Money inline :value="collection.floor" />
        </span>
      </div>

      <div class="flex gap-2">
        <UButton
          size="sm"
          variant="outline"
          class="flex-1"
          @click="handleView"
        >
          View
        </UButton>
        <UButton
          size="sm"
          class="flex-1"
          @click="handleManage"
        >
          Manage
        </UButton>
      </div>
    </div>
  </div>
</template>
