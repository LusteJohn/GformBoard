<script setup>
import { ref } from 'vue'
import { state } from '../store'
import { signIn, signInWithGoogle } from '../services/authService'

const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function submit() {
  error.value = ''
  busy.value = true
  const res = await signIn(email.value.trim(), password.value)
  busy.value = false
  if (res.success) {
    state.screen = 'forms'
  } else {
    error.value = res.message
  }
}

async function google() {
  error.value = ''
  busy.value = true
  const res = await signInWithGoogle()
  busy.value = false
  if (res.success) {
    state.screen = 'forms'
  } else {
    error.value = res.message
  }
}
</script>
<template>
  <div class="login">
    <div class="box">
      <h1>See every response like a task board</h1>
      <p class="mu">Sign in, pick a form, and review answers as cards, a table, or charts.</p>
      <form class="stack" @submit.prevent="submit">
        <input v-model="email" type="email" placeholder="Email" autocomplete="email" required />
        <input v-model="password" type="password" placeholder="Password" autocomplete="current-password" required />
        <button class="btn pri full" type="submit" :disabled="busy">
          {{ busy ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
      <p v-if="error" class="err">{{ error }}</p>
      <button class="btn g" type="button" :disabled="busy" @click="google"><b class="gl">G</b> Sign in with Google</button>
    </div>
  </div>
</template>
<style scoped>
.stack{display:flex;flex-direction:column;gap:10px;margin-top:18px}
.stack input{padding:11px 13px;border:1px solid var(--bd);border-radius:8px;background:var(--sf)}
.stack .full{margin-top:6px}
.err{color:var(--t3);font-size:13px;margin:10px 0 0}
</style>