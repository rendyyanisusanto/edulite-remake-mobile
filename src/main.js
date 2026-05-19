import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

/* Ionic core CSS */
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* App styles */
import './assets/styles/variables.css'
import './assets/styles/global.css'

/* Icons */
import './utils/icons'

/* Ionic PWA Elements (for Capacitor plugins like Camera on web) */
import { defineCustomElements } from '@ionic/pwa-elements/loader'

const app = createApp(App)

// Initialize PWA Elements
defineCustomElements(window)

app.use(IonicVue, {
  mode: 'ios'  // Use iOS mode for consistent cross-platform look
})
app.use(createPinia())
app.use(router)

router.isReady().then(() => {
  app.mount('#app')
})
