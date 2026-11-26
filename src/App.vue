<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { state, filteredResponses, runToastAction, refreshForms, setTheme } from './store'
import { signOutUser, onAuthChange } from './services/authService'
import Login from './components/Login.vue'
import FormsList from './components/FormsList.vue'
import FormView from './components/FormView.vue'
import CustomizePanel from './components/CustomizePanel.vue'
import DetailPanel from './components/DetailPanel.vue'
import ActivityPanel from './components/ActivityPanel.vue'
import AddFormPanel from './components/AddFormPanel.vue'

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
        <button class="btn" @click="state.customizing = true">Customize</button>
      </template>
      <span class="mu small">{{ state.user?.email }}</span>
      <div class="av">{{ initials }}</div>

      <div class="settings" ref="settingsEl">
        <button class="btn icon" :aria-expanded="settingsOpen" aria-label="Settings" @click.stop="toggleSettings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <div v-if="settingsOpen" class="menu">
          <button class="menu-item" @click="openActivity">
            <span>Activity</span>
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
          <button class="menu-item danger" @click="signOut">Sign out</button>
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
  <div v-if="state.toast" class="toast">
    {{ state.toast }}
    <button v-if="state.toastAction" class="toast-act" @click="runToastAction">{{ state.toastAction.label }}</button>
  </div>
</template>
<style scoped>
.boot{min-height:100vh;display:grid;place-items:center;color:var(--mu)}
.cnt{display:inline-block;margin-left:6px;background:var(--ac);color:var(--sf);border-radius:99px;font-size:11px;padding:0 6px;font-weight:700}
.theme{padding:6px 10px}
.toast-act{margin-left:10px;background:none;border:0;color:inherit;font-weight:700;text-decoration:underline;cursor:pointer}

.settings{position:relative}
.icon{display:grid;place-items:center;padding:7px}
.menu{position:absolute;right:0;top:calc(100% + 8px);z-index:30;width:240px;background:var(--sf);border:1px solid var(--bd);border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.22);padding:8px;display:flex;flex-direction:column;gap:6px}
.menu-item{display:flex;align-items:center;justify-content:space-between;width:100%;background:none;border:0;border-radius:8px;padding:9px 11px;font-weight:600;text-align:left}
.menu-item:hover{background:var(--acs)}
.menu-item.danger{color:var(--t3)}
.menu-block{padding:6px 11px}
.menu-label{display:block;font-size:12px;font-weight:600;color:var(--mu);margin-bottom:6px}
.menu-block .theme{width:100%}
.menu-sep{height:1px;background:var(--bd);margin:2px 0}
</style>