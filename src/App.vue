<script setup>
import { computed } from 'vue'
import { state } from './store'
import { signOutUser } from './services/authService'
import Login from './components/Login.vue'
import FormsList from './components/FormsList.vue'
import FormView from './components/FormView.vue'
import CustomizePanel from './components/CustomizePanel.vue'
import DetailPanel from './components/DetailPanel.vue'

const initials = computed(() => {
  const n = state.user?.name || state.user?.email || '?'
  return n.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')
})

async function signOut() {
  await signOutUser()
  state.user = null
  state.screen = 'login'
}
</script>

<template>
  <Login v-if="state.screen === 'login'" />
  <template v-else>
    <header class="top">
      <span class="logo">FormBoard</span><span class="sp"></span>
      <template v-if="state.screen === 'form'">
        <button class="btn" @click="$refs.fv.sync()">Sync responses</button>
        <button class="btn" @click="state.customizing = true">Customize</button>
      </template>
      <span class="mu small">{{ state.user?.email }}</span>
      <div class="av">{{ initials }}</div>
      <button class="btn" @click="signOut">Sign out</button>
    </header>
    <FormsList v-if="state.screen === 'forms'" />
    <FormView v-else ref="fv" />
    <CustomizePanel v-if="state.customizing" />
    <DetailPanel v-if="state.openId" />
  </template>
  <div v-if="state.toast" class="toast">{{ state.toast }}</div>
</template>
