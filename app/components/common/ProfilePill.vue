<script setup lang="ts">
defineProps<{
  address: string
}>()
</script>

<template>
  <div class="p-1 bg-secondary inline-block rounded-full">
    <UserInfo :avatar-size="40" :address="address" />
  </div>
</template>
