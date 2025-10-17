<script lang="ts" setup>
import { useSwipe } from '@vueuse/core'
import { descriptionTabs } from './descriptionTabs'
import OnBoardingCard from './OnBoardingCard.vue'

const router = useRouter()
const { $i18n } = useNuxtApp()

const numOfCards = 3
const currentSlide = ref(0)
const swipeThreshold = 40
const carouselRef = ref<HTMLElement | null>(null)

const activeDescriptionTab = ref('JSON')

useSwipe(carouselRef, {
  threshold: swipeThreshold,
  onSwipeEnd: (_, direction) => {
    if (direction === 'left') {
      nextSlide()
    }
    else if (direction === 'right') {
      prevSlide()
    }
  },
})

const cards = computed(() => {
  return Array.from({ length: numOfCards }, (_, i) => ({
    title: $i18n.t(`massmint.onboarding.cards.${i}.title`),
    content: $i18n.t(`massmint.onboarding.cards.${i}.content`),
  }))
})

function nextSlide() {
  if (currentSlide.value < numOfCards - 1) {
    currentSlide.value++
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

function toMassMint() {
  router
    .replace({
      path: `/massmint`,
    })
    .catch(console.warn)
}

const btn = computed(() =>
  currentSlide.value === 2
    ? {
        label: $i18n.t('massmint.onboarding.done'),
        variant: 'primary' as const,
        onClick: toMassMint,
      }
    : {
        label: $i18n.t('massmint.onboarding.next'),
        variant: 'primary' as const,
        onClick: nextSlide,
      },
)

const carouselStyle = computed(() => {
  const translateX = currentSlide.value * 100
  return {
    transform: `translateX(-${translateX}%)`,
    transition: 'transform 0.5s ease-in-out',
  }
})

function downloadTemplate() {
  downloadFile(`/massmint/template.${activeDescriptionTab.value.toLowerCase()}`, 'template')
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between px-8">
      <h1 class="text-3xl md:text-4xl font-bold text-center flex-1">
        {{ $t('massmint.onboarding.pageTitle') }}
      </h1>
      <UButton
        :label="$t('massmint.onboarding.skip')"
        icon="i-heroicons-arrow-right"
        variant="outline"
        @click="toMassMint"
      />
    </div>

    <!-- Carousel Container -->
    <div class="relative max-w-4xl mx-auto">
      <div
        ref="carouselRef"
        class="flex"
        :style="carouselStyle"
      >
        <div
          v-for="(card, index) in cards"
          :key="index"
          class="w-full flex-shrink-0 px-4"
        >
          <OnBoardingCard
            :title="card.title"
            :count="`${index + 1}/${cards.length}`"
            :content="card.content"
            :active="index === currentSlide"
          >
            <div v-if="index === 1" class="space-y-4">
              <div>
                <h3 class="text-base font-bold mb-3">
                  {{ $t('massmint.onboarding.cards.1.subtitle') }}:
                </h3>
                <p class="text-base mb-5">
                  {{ $t('massmint.onboarding.cards.1.instructions') }}
                </p>
              </div>

              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h4 class="text-base font-bold">
                  {{ $t('massmint.onboarding.cards.1.codeStructure') }}:
                </h4>
                <div class="flex gap-3">
                  <UButton
                    v-for="tab in descriptionTabs"
                    :key="tab.label"
                    :label="tab.label"
                    :variant="activeDescriptionTab === tab.label ? 'solid' : 'outline'"
                    size="sm"
                    @click="activeDescriptionTab = tab.label"
                  />
                </div>
              </div>

              <div class="h-48 w-full overflow-auto bg-accent p-4 rounded-xs">
                <MarkdownPreview
                  :source="descriptionTabs[activeDescriptionTab as keyof typeof descriptionTabs].fileStructureDescription"
                  class="w-full "
                />
              </div>

              <div class="flex justify-end">
                <UButton
                  variant="ghost"
                  color="primary"
                  size="sm"
                  @click="downloadTemplate"
                >
                  {{ $t('massmint.onboarding.downloadTemplate') }}
                  <UIcon name="i-heroicons-arrow-up-right" />
                </UButton>
              </div>
            </div>
          </OnBoardingCard>
        </div>
      </div>

      <!-- Navigation Arrows -->
      <UButton
        v-if="currentSlide > 0"
        class="absolute left-1 top-1/2 -translate-y-1/2 z-10 aspect-square"
        size="sm"
        variant="outline"
        icon="i-heroicons-chevron-left"
        @click="prevSlide"
      />

      <UButton
        v-if="currentSlide < numOfCards - 1"
        class="absolute right-1 top-1/2 -translate-y-1/2 z-10 aspect-square"
        size="sm"
        variant="outline"
        icon="i-heroicons-chevron-right"
        @click="nextSlide"
      />
    </div>

    <!-- Action Button -->
    <div class="flex justify-center">
      <UButton
        :label="btn.label"
        variant="solid"
        color="primary"
        size="lg"
        class="min-w-72"
        @click="btn.onClick"
      />
    </div>
  </div>
</template>
