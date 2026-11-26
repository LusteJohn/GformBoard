<script setup>
import { ref } from 'vue'
import { signInWithGoogle, signOutUser, getToken } from '../services/authService'
import { seedCollections, listMyForms } from '../services/firestore'
import { getDriveForms, addGoogleForm } from '../services/forms'

const user = ref(null), msg = ref('Not signed in'), busy = ref(false)
const run = async fn => { busy.value = true; try { await fn() } catch (e) { msg.value = 'Error: ' + e.message } busy.value = false }

const login = () => run(async () => {
  const r = await signInWithGoogle()
  if (!r.success) throw new Error(r.message)
  user.value = r
  msg.value = 'Signed in as ' + r.email
})
const logout = () => run(async () => { await signOutUser(); user.value = null; msg.value = 'Signed out' })
const seed = () => run(async () => {
  await seedCollections({ uid: user.value.uid, displayName: user.value.name, email: user.value.email, photoURL: user.value.photoURL })
  msg.value = 'Created users, forms and reviews. Check the Firestore console.'
})
const addForm = () => run(async () => {
  if (!getToken()) await login()
  const drive = await getDriveForms(getToken())
  if (!drive.length) return (msg.value = 'No Google Forms found in your Drive.')
  const picked = drive[0]
  const r = await addGoogleForm({ uid: user.value.uid }, getToken(), picked)
  msg.value = r.existed ? `“${picked.name}” was already added` : `Added “${picked.name}”`
})
const list = () => run(async () => { msg.value = 'Your forms: ' + (await listMyForms(user.value.uid)).map(f => f.title).join(', ') })
</script>

<template>
  <div class="fbsetup">
    <b>Firebase setup (dev)</b>
    <div class="mu small">{{ msg }}</div>
    <div class="row">
      <button class="btn" :disabled="busy" @click="user ? logout() : login()">{{ user ? 'Sign out' : 'Sign in' }}</button>
      <button class="btn" :disabled="busy || !user" @click="seed">Create collections</button>
      <button class="btn" :disabled="busy || !user" @click="addForm">Add form</button>
      <button class="btn" :disabled="busy || !user" @click="list">List my forms</button>
    </div>
  </div>
</template>

<style scoped>
.fbsetup{position:fixed;left:16px;bottom:16px;z-index:40;background:var(--sf);border:1px solid var(--bd);border-radius:12px;padding:12px 14px;max-width:420px;box-shadow:0 6px 24px rgba(0,0,0,.15)}
.row{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
</style>