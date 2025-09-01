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
    build: {
      rollupOptions: {
        output: {
          entryFileNames: 'tdn-flowchat.js',
          assetFileNames: 'tdn-flowchat-[name].[ext]',
        },
      },
      outDir: 'flowchat/dist'
    },

    define: {
      __VUE_PROD_DEVTOOLS__: !isProduction,
    },
  }
})
