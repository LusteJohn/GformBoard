import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { initTheme } from './store'

initTheme()
createApp(App).mount('#app')

// PWA: register the service worker for installability + offline fallback.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((e) => console.error('SW registration failed:', e))
  })
}