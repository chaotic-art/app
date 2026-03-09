<script lang="ts" setup>
import CreateNftMintForm from '~/components/create/NftMintForm.vue'

definePageMeta({
  title: 'Create NFT',
  layout: 'default',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <CreateNftMintForm />
  </div>
</template>
