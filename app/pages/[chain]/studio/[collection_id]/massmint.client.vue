<script setup lang="ts">
import { useStudioCollection } from '~/composables/studio/useStudioCollection'
import { useStudioNavGuard } from '~/composables/studio/useStudioNavGuard'

const route = useRoute()
const collection = useStudioCollection()

const returnRoute = computed(() =>
  `/${route.params.chain}/studio/${route.params.collection_id}`,
)

const { showWarning, confirmLeave, cancelLeave } = useStudioNavGuard()
</script>

<template>
  <div class="h-full">
    <MassMintWizard
      :collection-id="collection.id"
      :chain="collection.chain"
      :collection-name="collection.name"
      :existing-item-count="Number(collection.claimed || 0)"
      :return-route="returnRoute"
      compact
    />

    <!-- Navigation Warning Dialog -->
    <UModal v-model:open="showWarning">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold">
            Leave Mass Mint?
          </h3>
          <p class="text-muted-foreground">
            You have an active minting session. Leaving will discard your progress.
          </p>
          <div class="flex justify-end gap-3">
            <UButton variant="outline" @click="cancelLeave">
              Stay
            </UButton>
            <UButton color="error" @click="confirmLeave">
              Leave
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
