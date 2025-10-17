<script lang="ts" setup>
import Logo from '@/assets/svg/navbar-logo.svg'

interface FooterLinkItem {
  label: string
  href: string
  icon?: string
}

const footerLinks: Array<
  { title: string, type: 'links' | 'buttons', items: FooterLinkItem[] }
> = [
  // {
  //   title: 'Incentives',
  //   type: 'links',
  //   items: [
  //     { label: 'Developers', href: '#' },
  //     { label: 'FAQ', href: '#' },
  //     { label: 'Referral Program', href: '#' },
  //     { label: 'Artist Program', href: '#' },
  //   ],
  // },
  {
    title: 'Chaotic',
    type: 'links',
    items: [
      { label: 'Presskit', href: 'https://github.com/chaotic-art/presskit' },
      { label: 'Code Checker', href: '/code-checker' },
      { label: 'Medium', href: 'https://medium.com/chaoticart' },
      { label: 'Docs', href: 'https://docs.chaotic.art/start-here' },
    ],
  },
  {
    title: 'Social',
    type: 'buttons',
    items: [
      { label: 'Twitter', href: 'https://x.com/ChaoticApp', icon: 'i-simple-icons:x' },
      { label: 'Telegram', href: 'https://t.me/+A3xwht0aOIMxMjQ0', icon: 'i-simple-icons:telegram' },
      { label: 'GitHub', href: 'https://github.com/chaotic-art/app', icon: 'i-simple-icons:github' },
    ],
  },
]
</script>

<template>
  <UContainer class="mb-8 md:mb-16">
    <footer class="bg-muted rounded-[30px] overflow-hidden">
      <UContainer class="px-6 md:px-[60px] py-6 md:py-[40px]">
        <!-- Main Footer Content -->
        <div class="flex flex-col md:flex-row justify-between gap-8 md:gap-0">
          <!-- Become Artist Section -->
          <div class="max-w-full md:max-w-xs mb-6 md:mb-0 flex flex-col items-center md:items-start">
            <Logo class="select-none w-10 h-10 md:w-14 md:h-14 mb-3" :font-controlled="false" />
            <div class="text-2xl md:text-[42px] font-serif italic font-medium mb-4 md:mb-6 w-full md:w-[400px] text-center md:text-left text-foreground">
              {{ $t('footer.becomeArtist') }}
            </div>
            <div class="flex justify-center md:justify-start">
              <UButton :label="$t('footer.getInTouch')" class="rounded-full px-6 md:px-4" target="_blank" href="https://t.me/+A3xwht0aOIMxMjQ0" />
            </div>
          </div>

          <!-- Footer Links -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 md:mr-12">
            <template v-for="col in footerLinks" :key="col.title">
              <div class="text-center md:text-left">
                <h3 class="text-xl md:text-2xl font-serif italic font-medium mb-3 md:mb-4 text-foreground" :class="col.title === 'Social' ? 'mr-4' : ''">
                  {{ col.title }}
                </h3>
                <ul v-if="col.type === 'links'" class="space-y-2">
                  <li v-for="item in col.items" :key="item.label">
                    <a :href="item.href" target="_blank" class="text-muted-foreground hover:text-accent-foreground transition-colors">{{ item.label }}</a>
                  </li>
                </ul>
                <div v-else-if="col.type === 'buttons'" class="flex flex-col gap-2 items-center md:items-start">
                  <UButton
                    v-for="item in col.items"
                    :key="item.label"
                    :label="item.label"
                    :href="item.href"
                    :icon="item.icon"
                    target="_blank"
                    variant="outline"
                    class="rounded-full w-fit"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </UContainer>
      <div class="bg-cover bg-center bg-no-repeat h-[80px] md:h-[112px]" style="background-image: url('/imgs/footer-bottom-bg.png');" />
    </footer>
  </UContainer>
</template>
