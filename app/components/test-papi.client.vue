<script setup lang="ts">
const { $api } = useNuxtApp()

const account = '16JGzEsi8gcySKjpmxHVrkLTHdFHodRepEz8n244gNZpr9J'
const accountInfo = await $api().query.System.Account.getValue(account)
</script>

<template>
  <p>{{ account }} - {{ Number(accountInfo.data.free) }}</p>
</template>
