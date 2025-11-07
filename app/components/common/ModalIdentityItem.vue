<script lang="ts" setup>
const { accountId } = useAuth()
</script>

<template>
  <div class="p-3 border border-border rounded-full">
    <UserInfo
      :address="accountId"
      :avatar-size="40"
      transparent-background
    />
  </div>
</template>
