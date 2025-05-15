<script lang="ts" setup>
import Articles from './Articles.vue'
</script>

<template>
  <div>
    <UContainer>
      <h1 class="font-bold text-2xl text-(--ui-primary)">
        Landing Page {{ $t('test_i18n') }}
      </h1>

      <ClientOnly>
        <TestPapi />

        <template #fallback>
          <p>Loading . . .</p>
        </template>
      </ClientOnly>
    </UContainer>

    <!-- Articles Section -->
    <Articles />
  </div>
</template>
