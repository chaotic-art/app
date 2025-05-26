<script lang="ts" setup>
interface FooterLinkItem {
  label: string
  href: string
}

const footerLinks: Array<
  { title: string, type: 'links' | 'buttons', items: FooterLinkItem[] }
> = [
  {
    title: 'Incentives',
    type: 'links',
    items: [
      { label: 'Developers', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Referral Program', href: '#' },
      { label: 'Artist Program', href: '#' },
    ],
  },
  {
    title: 'DotMint',
    type: 'links',
    items: [
      { label: 'Why Dotmint', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Tutorials', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Presskit', href: '#' },
    ],
  },
  {
    title: 'Social',
    type: 'buttons',
    items: [
      { label: 'Twitter', href: '#' },
      { label: 'Youtube', href: '#' },
      { label: 'Instagram', href: '#' },
      { label: 'Telegram', href: '#' },
    ],
  },
]
</script>

<template>
  <UContainer class="mb-16 mt-8">
    <footer class="bg-[#FAFAFA] rounded-[30px] overflow-hidden">
      <UContainer class="px-[60px] py-[40px]">
        <!-- Main Footer Content -->
        <div class="flex flex-col md:flex-row justify-between">
          <!-- Become Artist Section -->
          <div class="max-w-xs mb-8 md:mb-0">
            <div class="text-[50px] font-serif italic font-medium mb-6 w-[400px]">
              {{ $t('footer.becomeArtist') }}
            </div>
            <UButton :label="$t('footer.getInTouch')" class="rounded-full px-4" color="neutral" variant="solid" />
          </div>

          <!-- Footer Links -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-16">
            <template v-for="col in footerLinks" :key="col.title">
              <div>
                <h3 class="text-2xl font-serif italic font-medium mb-4" :class="col.title === 'Social' ? 'mr-4' : ''">
                  {{ col.title }}
                </h3>
                <ul v-if="col.type === 'links'" class="space-y-2 text-gray-500">
                  <li v-for="item in col.items" :key="item.label">
                    <a :href="item.href" class="hover:text-primary-500">{{ item.label }}</a>
                  </li>
                </ul>
                <div v-else-if="col.type === 'buttons'" class="flex flex-col gap-2">
                  <UButton
                    v-for="item in col.items"
                    :key="item.label"
                    :label="item.label"
                    variant="outline"
                    class="rounded-full text-gray-500 w-fit"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </UContainer>
      <div class="bg-cover bg-center bg-no-repeat h-[112px]" style="background-image: url('/imgs/footer-bottom-bg.png');" />
    </footer>
  </UContainer>
</template>
