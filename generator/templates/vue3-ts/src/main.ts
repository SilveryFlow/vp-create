import { createApp } from 'vue'
import { createPinia } from 'pinia'

import DirectivesPlugin from './directives'

import App from './App.vue'
import router from './router'

import '@csstools/normalize.css'
import 'virtual:uno.css'
import '@/assets/styles/index.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(DirectivesPlugin)

app.mount('#app')
