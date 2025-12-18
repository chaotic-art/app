<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <UIcon name="i-heroicons-funnel" class="text-lg text-muted-foreground" />
      <span class="font-semibold text-foreground">{{ $t('explore.filters') }}</span>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-1">
      <slot name="actions" />
    </div>
  </div>
</template>
