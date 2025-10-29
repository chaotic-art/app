<script setup lang="ts">
import { MassMint } from '~/components/massmint'

definePageMeta({
  title: 'Mass Mint',
  layout: 'default',
})

const router = useRouter()

function handleBackToOnboarding() {
  router.push('/massmint/onboarding')
}
</script>

<template>
  <UContainer>
    <MassMint @back-to-onboarding="handleBackToOnboarding" />
  </UContainer>
</template>
