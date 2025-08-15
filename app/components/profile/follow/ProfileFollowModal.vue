<script setup lang="ts">
import ProfileFollowTab from '@/components/profile/follow/ProfileFollowTab.vue'

export type Tab = 'followers' | 'following'

const props = defineProps<{
  modelValue: boolean
  initialTab: Tab
  followersCount: number
  followingCount: number
}>()

const emit = defineEmits(['close'])

const activeTab = ref<Tab>('followers')

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    if (!value) {
      emit('close')
    }
  },
})

const tabItems = computed(() => [
  {
    label: `Followers (${props.followersCount})`,
    value: 'followers' as Tab,
  },
  {
    label: `Following (${props.followingCount})`,
    value: 'following' as Tab,
  },
])

function close() {
  isOpen.value = false
  emit('close')
}

onBeforeUnmount(close)

watchEffect(() => {
  activeTab.value = props.initialTab
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
  >
    <template #body>
      <div class="p-6">
        <div class="mb-6">
          <UTabs
            v-model="activeTab"

            :items="tabItems"
            :content="false"
            variant="pill"
            color="primary"
            size="sm"
            class="w-full"
            :ui="{
              list: 'rounded-lg p-1 gap-1',
              trigger: 'flex-1 transition-colors duration-200',
            }"
          />
        </div>
        <div class="min-h-[300px]">
          <ProfileFollowTab
            v-if="activeTab === 'followers'"
            type="followers"
            :total-count="followersCount"
          />
          <ProfileFollowTab
            v-else
            type="following"
            :total-count="followingCount"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
