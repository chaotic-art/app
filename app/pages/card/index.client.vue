<script setup lang="ts">
definePageMeta({
  title: 'Mint Card',
  layout: 'empty',
})

const { setColorMode, currentMode } = useTheme()
const { doAfterLogin } = useDoAfterlogin()

// only dark mode for this page
watch(currentMode, () => {
  setColorMode('dark')
}, { immediate: true })

onUnmounted(() => {
  setColorMode('system')
})

function handleClaimClick() {
  doAfterLogin({
    onLoginSuccess: () => {
      // TODO: Implement claim functionality
    },
  })
}
</script>

<template>
  <div class="min-h-full flex flex-col overflow-hidden bg-black">
    <LazyNavbar />
    <MintCard @claim="handleClaimClick" />
    <LazyFooter />
  </div>
</template>
