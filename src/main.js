import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { initTheme } from './store'

initTheme()
createApp(App).mount('#app')