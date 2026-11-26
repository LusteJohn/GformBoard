<script setup>
import { ref } from 'vue'
import { signInWithGoogle, signOutUser } from '../services/authService'
import { pickForm } from '../services/picker'
import { fetchForm, questionsOf, defaultLayout, isQuiz } from '../services/googleForms'
import { saveForm, seedCollections, listMyForms } from '../services/firestore'
import { getToken } from '../services/authService'

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
  const picked = await pickForm(getToken())
  if (!picked) return (msg.value = 'Cancelled')
  const form = await fetchForm(picked.id, getToken())
  const qs = questionsOf(form)
  const r = await saveForm({ uid: user.value.uid }, picked, { type: isQuiz(form) ? 'quiz' : 'other', layout: defaultLayout(qs) })
  msg.value = r.existed ? `“${picked.name}” was already added` : `Added “${picked.name}” (${qs.length} questions)`
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