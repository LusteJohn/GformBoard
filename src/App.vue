<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { state, filteredResponses, runToastAction, refreshForms, setTheme, pauseToast, resumeToast } from './store'
import { signOutUser, onAuthChange } from './services/authService'
import Login from './components/Login.vue'
import FormsList from './components/FormsList.vue'
import FormView from './components/FormView.vue'
import CustomizePanel from './components/CustomizePanel.vue'
import DetailPanel from './components/DetailPanel.vue'
import ActivityPanel from './components/ActivityPanel.vue'
import AddFormPanel from './components/AddFormPanel.vue'
import AppIcon from './components/AppIcon.vue'

const initials = computed(() => {
  const n = state.user?.name || state.user?.email || '?'
  return n.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')
})

const settingsOpen = ref(false)
const settingsEl = ref(null)
function toggleSettings() { settingsOpen.value = !settingsOpen.value }
function openActivity() { state.activityOpen = true; settingsOpen.value = false }
function onDocClick(e) {
  if (settingsOpen.value && settingsEl.value && !settingsEl.value.contains(e.target)) settingsOpen.value = false
}

let unsub
onMounted(() => {
  unsub = onAuthChange((user) => {
    if (user) {
      state.user = { uid: user.uid, name: user.displayName, email: user.email, photoURL: user.photoURL }
      if (state.screen === 'login') state.screen = 'forms'
      refreshForms()
    } else {
      state.user = null
      state.screen = 'login'
    }
    state.authReady = true
  })
  window.addEventListener('keydown', onKey)
  document.addEventListener('click', onDocClick)
})
onUnmounted(() => {
  unsub && unsub()
  window.removeEventListener('keydown', onKey)
  document.removeEventListener('click', onDocClick)
})

function onKey(e) {
  if (e.key === 'Escape') {
    state.openId = null
    state.customizing = false
    state.activityOpen = false
    settingsOpen.value = false
    return
  }
  const tag = (e.target.tagName || '').toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.key === '/') {
    e.preventDefault()
    const id = state.screen === 'form' ? 'response-search' : 'form-search'
    const el = document.getElementById(id)
    if (el) el.focus()
    return
  }
  if (state.screen !== 'form' || state.tab === 'insights') return
  const forward = e.key === 'j' || e.key === 'ArrowRight'
  const back = e.key === 'k' || e.key === 'ArrowLeft'
  if (!forward && !back) return
  const list = filteredResponses.value
  if (!list.length) return
  e.preventDefault()
  const idx = list.findIndex(r => r.id === state.openId)
  let nextIdx
  if (forward) nextIdx = idx === -1 ? 0 : (idx + 1) % list.length
  else nextIdx = idx === -1 ? list.length - 1 : (idx - 1 + list.length) % list.length
  state.openId = list[nextIdx].id
}

async function signOut() {
  settingsOpen.value = false
  await signOutUser()
  state.user = null
  state.screen = 'login'
}
</script>

<template>
  <div v-if="!state.authReady" class="boot">Loading…</div>
  <Login v-else-if="state.screen === 'login'" />
  <template v-else>
    <header class="top">
      <span class="logo">FormBoard</span><span class="sp"></span>
      <template v-if="state.screen === 'form'">
        <button class="btn" @click="state.customizing = true"><AppIcon name="sliders" :size="16" /> Customize</button>
      </template>
      <span class="mu small">{{ state.user?.email }}</span>
      <div class="av">{{ initials }}</div>

      <div class="settings" ref="settingsEl">
        <button class="btn icon" :aria-expanded="settingsOpen" aria-label="Settings" @click.stop="toggleSettings">
          <AppIcon name="settings" :size="18" />
        </button>

        <div v-if="settingsOpen" class="menu">
          <button class="menu-item" @click="openActivity">
            <span class="mi-label"><AppIcon name="activity" :size="16" /> Activity</span>
            <span v-if="state.activity.length" class="cnt">{{ state.activity.length }}</span>
          </button>
          <div class="menu-block">
            <label class="menu-label">Appearance</label>
            <select class="btn theme" :value="state.theme" aria-label="Appearance" @change="setTheme($event.target.value)">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div class="menu-sep"></div>
          <button class="menu-item danger" @click="signOut"><span class="mi-label"><AppIcon name="logout" :size="16" /> Sign out</span></button>
        </div>
      </div>
    </header>
    <FormsList v-if="state.screen === 'forms'" />
    <FormView v-else ref="fv" />
    <CustomizePanel v-if="state.customizing" />
    <DetailPanel v-if="state.openId" />
    <ActivityPanel v-if="state.activityOpen" />
    <AddFormPanel v-if="state.pickerOpen" />
  </template>
  <div v-if="state.toast" class="toast" @mouseenter="pauseToast" @mouseleave="resumeToast">
    {{ state.toast }}
    <button v-if="state.toastAction" class="toast-act" @click="runToastAction">{{ state.toastAction.label }}</button>
  </div>
</template>
<style scoped src="./assets/css/App.css"></style>