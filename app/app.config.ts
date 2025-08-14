export default defineAppConfig({
  // https://ui.nuxt.com/getting-started/theme#design-system
  ui: {
    colors: {
      primary: 'neutral',
      neutral: 'neutral',
    },
    // New York style
    // https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/button.tsx
    button: {
      slots: {
        base: [`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive`],
      },
      variants: {
        variant: {
          solid: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
          destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
          outline: 'bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
          secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
          ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
          link: 'text-primary underline-offset-4 hover:underline',
        },
        size: {
          sm: {
            base: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
          },
          md: {
            base: 'h-9 px-4 py-2 has-[>svg]:px-3',
          },
          lg: {
            base: 'h-10 px-6 has-[>svg]:px-4',
          },
        },
      },
    },
  },
})
