import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode
  const isProduction = mode === 'production'
  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // Use your actual public path here
    base: '/ask-agar/',
    build: {
      rollupOptions: {
        output: {
          entryFileNames: 'flowchat.js',
          assetFileNames: 'flowchat-[name].[ext]',
        },
      },
      base: 'flowchat',
    },

    define: {
      __VUE_PROD_DEVTOOLS__: !isProduction,
    },
  }
})
