<script lang="ts" setup>
const props = defineProps<{
  followersCount?: number
  followingCount?: number
}>()

const emit = defineEmits(['clickFollowers', 'clickFollowing'])
const statsRows = computed(() => [

  {
    label: 'Followers',
    value: props.followersCount ?? '-',
    onClick: () => emit('clickFollowers'),
  },
  {
    label: 'Following',
    value: props.followingCount ?? '-',
    onClick: () => emit('clickFollowing'),
  },
])
</script>

<template>
  <div
    class="flex flex-col items-center gap-2.5"
  >
    <div
      v-for="(item, index) in statsRows"
      :key="index"
      class="flex justify-between w-full items-center group"
      :class="{ 'cursor-pointer': item.onClick }"
      @click="item.onClick"
    >
      <span class="text-sm text-k-grey">
        {{ item.label }}
      </span>
      <div
        class="text-md md:text-lg font-bold"
        :class="{ 'group-hover:underline underline-offset-4': item.onClick }"
      >
        <span>{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>
