<script setup lang="ts">
const { $sdk } = useNuxtApp()
const api = $sdk().api

const account = '16JGzEsi8gcySKjpmxHVrkLTHdFHodRepEz8n244gNZpr9J'
const accountInfo = await api.query.System.Account.getValue(account)
</script>

<template>
  <p>{{ account }} - {{ Number(accountInfo.data.free) }}</p>
</template>
