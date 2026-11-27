<script setup>
import { ref, onMounted } from 'vue'

const KEY = 'formboard_intro_seen'
const steps = [
  { title: 'Pick a form', text: 'Choose a Google Form from your Drive to start reviewing its responses.' },
  { title: 'Drag to change status', text: 'In Board view, drag cards between columns to move them through review.' },
  { title: 'Open a card for notes', text: 'Click any card to set its status, score, and feedback notes.' }
]

const idx = ref(0)
const visible = ref(false)
onMounted(() => {
  try { visible.value = localStorage.getItem(KEY) !== '1' } catch { visible.value = true }
})
function finish() {
  visible.value = false
  try { localStorage.setItem(KEY, '1') } catch { /* ignore */ }
}
function next() {
  if (idx.value < steps.length - 1) idx.value++
  else finish()
}
</script>

<template>
  <div v-if="visible" class="coach" role="dialog" aria-label="Getting started">
    <div class="coach-dots"><span v-for="(s, i) in steps" :key="i" :class="{ on: i === idx }"></span></div>
    <h3>{{ steps[idx].title }}</h3>
    <p class="mu small">{{ steps[idx].text }}</p>
    <div class="coach-actions">
      <button class="btn" @click="finish">Skip</button>
      <button class="btn pri" @click="next">{{ idx < steps.length - 1 ? 'Next' : 'Got it' }}</button>
    </div>
  </div>
</template>

<style scoped src="../assets/css/CoachMarks.css"></style>