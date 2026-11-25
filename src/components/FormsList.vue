<script setup>
import { computed } from 'vue'
import { state, openForm } from '../store'
const types = ['All', 'Quiz', 'Survey', 'Exam']
const list = computed(() => Object.entries(state.forms).filter(([, f]) =>
  (state.typeFilter === 'All' || f.type === state.typeFilter) &&
  f.name.toLowerCase().includes(state.search.toLowerCase())))
const pending = f => f.responses.filter(r => r.status === 'To review').length
</script>
<template>
  <main class="wrap">
    <h1>My forms</h1>
    <div class="mu">Loaded from your Google Drive. Pick one to open its responses.</div>
    <div class="bar">
      <input v-model="state.search" placeholder="Search forms" />
      <button v-for="t in types" :key="t" class="chip" :class="{ on: state.typeFilter === t }" @click="state.typeFilter = t">{{ t }}</button>
    </div>
    <div class="grid">
      <button v-for="[id, f] in list" :key="id" class="fc" @click="openForm(id)">
        <span class="tag ty">{{ f.type }}</span>
        <b>{{ f.name }}</b>
        <span class="mu">{{ f.responses.length }} responses</span>
        <span class="mu small">{{ f.modified }}</span>
        <span v-if="pending(f)" class="tag s0">{{ pending(f) }} to review</span>
        <span v-else class="tag s1">All reviewed</span>
      </button>
    </div>
    <p v-if="!list.length" class="mu">No forms match. Clear the search or pick another type.</p>
  </main>
</template>
