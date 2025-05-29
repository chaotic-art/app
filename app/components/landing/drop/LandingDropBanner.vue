<script setup lang="ts">
import { getDrops } from '@/services/fxart'
import { useQuery } from '@tanstack/vue-query'

const { data: dropItems } = useQuery({
  queryKey: ['landing-drop-items', 'ahp'],
  queryFn: () => getDrops({
    active: [true],
    chain: ['ahp'],
    limit: 3,
  }),
})

const mainDrop = computed(() => dropItems.value?.[0])
const subDrops = computed(() => dropItems.value?.slice(1, 3))
</script>

<template>
  <div class="flex flex-col mb-[75px]">
    <DropCardAttributeEnhance v-if="mainDrop" :drop="mainDrop">
      <template #default="{ drop }">
        <LandingHorizontalDropCard :drop="drop" />
      </template>
    </DropCardAttributeEnhance>

    <div class="flex flex-col md:flex-row gap-6 mt-8">
      <DropCardAttributeEnhance v-for="subDrop in subDrops" :key="subDrop.id" :drop="subDrop">
        <template #default="{ drop }">
          <LandingSubDropCard v-if="drop" :drop="drop" />
        </template>
      </DropCardAttributeEnhance>
    </div>
  </div>
</template>
