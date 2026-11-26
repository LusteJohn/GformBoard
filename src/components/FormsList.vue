<script setup>
import { computed } from 'vue'
import { state, openForm, openAddForm, refreshForms } from '../store'
const types = ['All', 'Quiz', 'Survey', 'Exam']
const list = computed(() => Object.entries(state.forms).filter(([, f]) =>
  (state.typeFilter === 'All' || f.type === state.typeFilter) &&
  f.name.toLowerCase().includes(state.search.toLowerCase())))
const pending = f => f.responses.filter(r => r.status === 'To review').length
const hasAny = computed(() => Object.keys(state.forms).length > 0)
</script>
<template>
  <main class="wrap">
    <div class="head">
      <div>
        <h1>My forms</h1>
        <div class="mu">Forms saved in your Google Drive. Pick one to open its responses.</div>
      </div>
      <div class="actions">
        <button class="btn" :disabled="state.loadingForms" @click="refreshForms">Refresh</button>
        <button class="btn pri" :disabled="state.loadingForms" @click="openAddForm">
          {{ state.loadingForms ? 'Loading…' : '+ Add Google Form' }}
        </button>
      </div>
    </div>
    <div class="bar">
      <input id="form-search" v-model="state.search" placeholder="Search forms ( / )" />
      <button v-for="t in types" :key="t" class="chip" :class="{ on: state.typeFilter === t }" @click="state.typeFilter = t">{{ t }}</button>
    </div>
    <div class="grid">
      <button v-for="[id, f] in list" :key="id" class="fc" @click="openForm(id)">
        <span class="tag ty">{{ f.type }}</span>
        <b>{{ f.name }}</b>
        <span class="mu">{{ f.responses.length }} responses</span>
        <span v-if="f.modified" class="mu small">{{ f.modified }}</span>
        <span v-if="pending(f)" class="tag s0">{{ pending(f) }} to review</span>
        <span v-else class="tag s1">All reviewed</span>
      </button>
    </div>
    <p v-if="!list.length" class="mu">{{ hasAny ? 'No forms match. Clear the search or pick another type.' : 'No forms yet. Click “+ Add Google Form” to pick one from your Drive.' }}</p>
  </main>
</template>
<style scoped src="../assets/css/FormsList.css"></style>
