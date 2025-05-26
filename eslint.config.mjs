// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './app/.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    // ...@antfu/eslint-config options
    ignores: ['**/*.papi/**'],
  }),
  // ...other rules
)
