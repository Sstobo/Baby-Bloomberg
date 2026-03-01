import { tanstackConfig } from '@tanstack/eslint-config'
import convexPlugin from '@convex-dev/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  ...tanstackConfig,
  ...convexPlugin.configs.recommended,
  eslintConfigPrettier, // Must be last to disable conflicting rules
  {
    ignores: ['convex/_generated/**', '.output/**'],
  },
]
