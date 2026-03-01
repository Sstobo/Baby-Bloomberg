import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig, loadEnv } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Make VITE_ env vars available to SSR
  Object.keys(env).forEach((key) => {
    if (key.startsWith('VITE_')) {
      process.env[key] = env[key]
    }
  })

  return {
    server: {
      port: 3000,
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tanstackStart(),
      nitro(),
      viteReact(),
    ],
  }
})
