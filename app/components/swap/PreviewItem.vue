<script setup lang="ts">
withDefaults(
  defineProps<{
    name?: string
    image: string
    removable?: boolean
  }>(),
  {
    removable: true,
  },
)

const emit = defineEmits(['remove'])
</script>

<template>
  <div
    class="flex justify-between items-center"
  >
    <div
      class="flex gap-4 items-center"
    >
      <MediaItemImage
        :src="image"
        :alt="name"
        size="8"
      />

      <slot name="name">
        <span>
          {{ name }}
        </span>
      </slot>
    </div>

    <UButton
      v-if="removable"
      size="sm"
      icon="mdi:cross-circle"
      variant="link"
      @click="emit('remove')"
    />
  </div>
</template>
