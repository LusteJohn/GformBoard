<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { state, filteredResponses, runToastAction, refreshForms } from './store'
import { signOutUser, onAuthChange } from './services/authService'
import Login from './components/Login.vue'
import FormsList from './components/FormsList.vue'
import FormView from './components/FormView.vue'
import CustomizePanel from './components/CustomizePanel.vue'
import DetailPanel from './components/DetailPanel.vue'
import ActivityPanel from './components/ActivityPanel.vue'

const initials = computed(() => {
  const n = state.user?.name || state.user?.email || '?'
  return n.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')
})

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
})
onUnmounted(() => {
  unsub && unsub()
  window.removeEventListener('keydown', onKey)
})

function onKey(e) {
  if (e.key === 'Escape') {
    state.openId = null
    state.customizing = false
    state.activityOpen = false
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
      <button class="btn" @click="state.activityOpen = true">
        Activity<span v-if="state.activity.length" class="cnt">{{ state.activity.length }}</span>
      </button>
      <span class="mu small">{{ state.user?.email }}</span>
      <div class="av">{{ initials }}</div>
      <button class="btn" @click="signOut">Sign out</button>
    </header>
    <FormsList v-if="state.screen === 'forms'" />
    <FormView v-else ref="fv" />
    <CustomizePanel v-if="state.customizing" />
    <DetailPanel v-if="state.openId" />
    <ActivityPanel v-if="state.activityOpen" />
  </template>
  <div v-if="state.toast" class="toast">
    {{ state.toast }}
    <button v-if="state.toastAction" class="toast-act" @click="runToastAction">{{ state.toastAction.label }}</button>
  </div>
</template>
<style scoped>
.boot{min-height:100vh;display:grid;place-items:center;color:var(--mu)}
.cnt{display:inline-block;margin-left:6px;background:var(--ac);color:var(--sf);border-radius:99px;font-size:11px;padding:0 6px;font-weight:700}
.toast-act{margin-left:10px;background:none;border:0;color:inherit;font-weight:700;text-decoration:underline;cursor:pointer}
</style>