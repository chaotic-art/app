<script setup lang="ts">
import { useStudioCollection } from '~/composables/studio/useStudioCollection'
import { useStudioDetails } from '~/composables/studio/useStudioDetails'

const collection = useStudioCollection()

const {
  description,
  royaltyPercentage,
  royaltyRecipient,
  isPublished,
  collaborators,
  inviteAddress,
  isDirty,
  save,
  addCollaborator,
  removeCollaborator,
} = useStudioDetails(collection)

const router = useRouter()
const showLeaveWarning = ref(false)
let pendingRoute: string | null = null
const allowLeave = ref(false)

onBeforeRouteLeave((to, _from, next) => {
  if (allowLeave.value) {
    allowLeave.value = false
    next()
    return
  }

  if (isDirty.value) {
    showLeaveWarning.value = true
    pendingRoute = to.fullPath
    next(false)
  }
  else {
    next()
  }
})

function confirmLeave() {
  showLeaveWarning.value = false
  if (pendingRoute) {
    const route = pendingRoute
    pendingRoute = null
    allowLeave.value = true
    router.push(route)
  }
}

function cancelLeave() {
  showLeaveWarning.value = false
  pendingRoute = null
}

const descriptionLength = computed(() => description.value.length)
</script>

<template>
  <div class="p-6 max-w-3xl">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-xl font-bold">
        Collection Details
      </h1>
      <UButton
        v-if="isDirty"
        icon="i-heroicons-check"
        @click="save"
      >
        Save Changes
      </UButton>
    </div>

    <div class="space-y-10">
      <!-- Section 1: Collection Info -->
      <section class="space-y-6">
        <h2 class="text-lg font-semibold border-b border-border pb-2">
          Collection Info
        </h2>

        <!-- Name (read-only) -->
        <div>
          <label class="text-sm font-medium block mb-1">Name</label>
          <UInput
            :model-value="collection.name"
            disabled
            size="lg"
            class="w-full"
          />
          <p class="text-xs text-muted-foreground mt-1">
            Collection name is set at creation and cannot be changed.
          </p>
        </div>

        <!-- Description -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-sm font-medium">Description</label>
            <span class="text-xs text-muted-foreground">{{ descriptionLength }} / 500</span>
          </div>
          <UTextarea
            v-model="description"
            placeholder="Describe your collection..."
            :rows="4"
            :maxlength="500"
            class="w-full"
          />
          <p class="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <UIcon name="i-simple-icons-markdown" class="w-4 h-4" />
            Supports markdown formatting.
          </p>
        </div>

        <!-- Logo Upload -->
        <div>
          <label class="text-sm font-medium block mb-2">Logo</label>
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center">
              <img
                v-if="collection.image"
                :src="sanitizeIpfsUrl(collection.image)"
                :alt="collection.name"
                class="w-full h-full object-cover"
              >
              <UIcon v-else name="i-heroicons-photo" class="w-8 h-8 text-muted-foreground" />
            </div>
            <UButton variant="outline" size="sm" icon="i-heroicons-arrow-up-tray">
              Upload Logo
            </UButton>
          </div>
        </div>

        <!-- Banner Upload -->
        <div>
          <label class="text-sm font-medium block mb-2">Banner</label>
          <div class="w-full h-32 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center">
            <img
              v-if="collection.banner"
              :src="sanitizeIpfsUrl(collection.banner)"
              :alt="collection.name"
              class="w-full h-full object-cover"
            >
            <div v-else class="text-center">
              <UIcon name="i-heroicons-photo" class="w-8 h-8 text-muted-foreground mx-auto mb-1" />
              <UButton variant="outline" size="xs" icon="i-heroicons-arrow-up-tray">
                Upload Banner
              </UButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: Creator Earnings -->
      <section class="space-y-6">
        <h2 class="text-lg font-semibold border-b border-border pb-2">
          Creator Earnings
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium block mb-1">Royalty %</label>
            <UInput
              v-model.number="royaltyPercentage"
              type="number"
              :min="0"
              :max="100"
              step="0.5"
            />
          </div>
          <div>
            <label class="text-sm font-medium block mb-1">Recipient Wallet</label>
            <UInput
              v-model="royaltyRecipient"
              placeholder="Wallet address..."
              class="font-mono text-xs"
            />
          </div>
        </div>
      </section>

      <!-- Section 3: Team -->
      <section class="space-y-6">
        <h2 class="text-lg font-semibold border-b border-border pb-2">
          Team
        </h2>

        <div class="space-y-3">
          <div
            v-for="(collab, i) in collaborators"
            :key="i"
            class="flex items-center justify-between border border-border rounded-lg px-4 py-3"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <UIcon name="i-heroicons-user" class="w-4 h-4 text-muted-foreground" />
              </div>
              <span class="font-mono text-xs truncate">{{ collab.address }}</span>
            </div>
            <div class="flex items-center gap-2">
              <UBadge :label="collab.role" variant="subtle" size="sm" />
              <UButton
                v-if="collab.role !== 'Owner'"
                variant="ghost"
                size="xs"
                icon="i-heroicons-x-mark"
                @click="removeCollaborator(i)"
              />
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <UInput
            v-model="inviteAddress"
            placeholder="Enter wallet address to invite..."
            class="flex-1 font-mono text-xs"
          />
          <UButton
            variant="outline"
            icon="i-heroicons-plus"
            @click="addCollaborator"
          >
            Invite
          </UButton>
        </div>
      </section>

      <!-- Section 4: Visibility -->
      <section class="space-y-6">
        <h2 class="text-lg font-semibold border-b border-border pb-2">
          Visibility
        </h2>

        <div class="flex items-center justify-between border border-border rounded-lg px-4 py-4">
          <div>
            <p class="font-medium text-sm">
              {{ isPublished ? 'Published' : 'Hidden' }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ isPublished
                ? 'Your collection is visible to everyone.'
                : 'Your collection is hidden from public view.'
              }}
            </p>
          </div>
          <USwitch v-model="isPublished" />
        </div>
      </section>
    </div>

    <!-- Unsaved Changes Warning -->
    <UModal v-model:open="showLeaveWarning">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold">
            Unsaved Changes
          </h3>
          <p class="text-muted-foreground">
            You have unsaved changes. Are you sure you want to leave?
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
