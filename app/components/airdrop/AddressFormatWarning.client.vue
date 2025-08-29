<script setup lang="ts">
const emit = defineEmits(['change'])
</script>

<template>
  <UAlert
    variant="soft"
    color="error"
    title="Address Format Warning"
    :closeable="false"
    description="Some addresses may need to be converted to the correct network format."
    :actions="[
      {
        label: 'Fix Addresses',
        variant: 'soft',
        color: 'success',
        size: 'sm',
        onClick: () => emit('change'),
      },
      {
        label: 'Learn More',
        variant: 'soft',
        color: 'warning',
        size: 'sm',
        onClick: () => { navigateTo('https://www.youtube.com/watch?v=3gPvGym8H7I', { external: true, open: { target: '_blank' } }) },
      },
    ]"
  />
</template>
