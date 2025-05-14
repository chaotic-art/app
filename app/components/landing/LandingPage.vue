<script lang="ts" setup>
</script>

<template>
  <div>
    <div class="flex flex-col items-center justify-center gap-4 h-screen">
      <h1 class="font-bold text-2xl text-(--ui-primary)">
        Landing Page {{ $t('test_i18n') }}
      </h1>

      <ClientOnly>
        <TestPapi />

        <template #fallback>
          <p>Loading . . .</p>
        </template>
      </ClientOnly>

      <div class="flex items-center gap-2">
        <UButton
          label="Documentation"
          icon="i-lucide-square-play"
          to="https://ui.nuxt.com/getting-started/installation/nuxt"
          target="_blank"
        />

        <UButton
          label="GitHub"
          color="neutral"
          variant="outline"
          icon="i-simple-icons-github"
          to="https://github.com/nuxt/ui"
          target="_blank"
        />
      </div>
    </div>
  </div>
</template>
