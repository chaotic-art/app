<script setup lang="ts">
import { SwapStep } from '@/components/swap/types'

const { accountId } = useAuth()
const route = useRoute()
const router = useRouter()
const { currentChain } = useChain()
const { isCurrentAccount } = useAuth()

const query = reactive({
  currentOwner_eq: route.params.id,
  currentOwner_not_eq: accountId.value,
  burned_eq: false,
})

watchEffect(() => {
  if (isCurrentAccount(route.params.id?.toString())) {
    router.push(`/${currentChain.value}/swap`)
  }
})
</script>

<template>
  <SwapLayoutSelection>
    <template #title>
      <SwapBannerTitle
        step="2/4"
        :title="$t('swap.selectNft')"
        :subtitle="$t('swap.clickOnNft')"
      />
    </template>

    <SwapGridList
      :query
      with-filters
      selectable
    />

    <template #preview>
      <SwapPreview :step="SwapStep.DESIRED" />
    </template>
  </SwapLayoutSelection>
</template>
