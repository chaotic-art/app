<template>
  <UContainer>
    <ClientOnly>
      <TestPapi class="mt-[100px]" />

      <template #fallback>
        <p>Loading . . .</p>
      </template>
    </ClientOnly>
  </UContainer>
</template>
