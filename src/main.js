import { createApp } from 'vue'
import App from './App.vue'
import '@/assets/global.css'
import { initAutoSave } from '@/game/autoSave.js'

const app = createApp(App)
app.mount('#app')

initAutoSave()