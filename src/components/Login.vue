<script setup>
import { ref } from 'vue'
import { state, refreshForms } from '../store'
import { signIn, signInWithGoogle } from '../services/authService'
import AppIcon from './AppIcon.vue'
import logoUrl from '../assets/images/gformboard-icon.svg'

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
    state.user = res
    state.screen = 'forms'
    await refreshForms()
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
    state.user = res
    state.screen = 'forms'
    await refreshForms()
  } else {
    error.value = res.message
  }
}
</script>
<template>
  <div class="login">
    <div class="card">
      <div class="brand">
        <img :src="logoUrl" alt="" class="mark-img" />
        <span class="brand-name">GFormBoard</span>
      </div>

      <h1>Welcome back</h1>
      <p class="sub">Sign in to turn your Google Form responses into a review board.</p>

      <button class="google" type="button" :disabled="busy" @click="google">
        <svg class="gicon" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        <span>{{ busy ? 'Please wait…' : 'Sign in with Google' }}</span>
      </button>

      <div class="divider"><span>or with email</span></div>

      <form class="stack" @submit.prevent="submit">
        <label class="field">
          <span><AppIcon name="mail" :size="14" /> Email</span>
          <input v-model="email" type="email" placeholder="you@example.com" autocomplete="email" required />
        </label>
        <label class="field">
          <span><AppIcon name="lock" :size="14" /> Password</span>
          <input v-model="password" type="password" placeholder="••••••••" autocomplete="current-password" required />
        </label>
        <button class="btn pri submit" type="submit" :disabled="busy">
          {{ busy ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p v-if="error" class="err">{{ error }}</p>

      <p class="foot">By continuing, you allow FormBoard to read your Google Forms and the files in your Drive.</p>
    </div>
  </div>
</template>
<style scoped src="../assets/css/Login.css"></style>