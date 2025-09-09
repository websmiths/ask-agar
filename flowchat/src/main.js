import './assets/scss/flowchat.scss'

import App from './App.vue'

import { createApp } from 'vue'
const app = createApp(App)

import { createPinia } from 'pinia'
const pinia = createPinia()

if (document.getElementById('header-search')) {
  app.config.idPrefix = 'app'
  app.use(pinia).mount('#header-search')
}


(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','flowLayer','GTM-TMMTR24W');
