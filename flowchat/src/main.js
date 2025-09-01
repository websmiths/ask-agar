
import './assets/scss/flowchat.scss'

import App from './App.vue'

import { createApp } from 'vue'
const app = createApp(App)


import { createPinia } from 'pinia'
const pinia = createPinia()

if (document.getElementById('flowchat')) {
  app.config.idPrefix = 'app'
  app.use(pinia).mount('#flowchat')
}

if (document.getElementById('header-search')) {
  app.config.idPrefix = 'app'
  app.use(pinia).mount('#header-search')
}
