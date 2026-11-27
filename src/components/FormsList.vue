<script setup>
import { computed } from 'vue'
import { state, openForm, openAddForm, refreshForms } from '../store'
import AppIcon from './AppIcon.vue'
// Derive chips from the actual form types so nothing (e.g. "Other") is hidden.
const types = computed(() => ['All', ...Array.from(new Set(Object.values(state.forms).map(f => f.type))).sort()])
const list = computed(() => Object.entries(state.forms).filter(([, f]) =>
  (state.typeFilter === 'All' || f.type === state.typeFilter) &&
  f.name.toLowerCase().includes(state.search.toLowerCase())))
const pending = f => f.responses.filter(r => r.status === 'To review').length
const hasAny = computed(() => Object.keys(state.forms).length > 0)
function clearFilters() { state.search = ''; state.typeFilter = 'All' }
</script>
<template>
  <main class="wrap">
    <div class="head">
      <div>
        <h1>My forms</h1>
        <div class="mu">Forms saved in your Google Drive. Pick one to open its responses.</div>
      </div>
      <div class="actions">
        <button class="btn" :disabled="state.loadingForms" @click="refreshForms"><AppIcon name="refresh" :size="16" /> Refresh</button>
        <button class="btn pri" :disabled="state.loadingForms" @click="openAddForm">
          <AppIcon name="plus" :size="16" /> {{ state.loadingForms ? 'Loading…' : 'Add Google Form' }}
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
        <span class="fc-head"><AppIcon name="form" :size="18" /> <b>{{ f.name }}</b></span>
        <span class="mu">{{ f.responses.length }} responses</span>
        <span v-if="f.modified" class="mu small">{{ f.modified }}</span>
        <span v-if="pending(f)" class="tag s0">{{ pending(f) }} to review</span>
        <span v-else class="tag s1">All reviewed</span>
      </button>
    </div>
    <div v-if="!list.length" class="empty">
      <template v-if="hasAny">
        <p class="empty-title">No forms match</p>
        <p class="mu small">Try a different search or type.</p>
        <button class="btn" @click="clearFilters">Clear search</button>
      </template>
      <template v-else>
        <p class="empty-title">No forms yet</p>
        <p class="mu small">Add a Google Form from your Drive to get started.</p>
        <button class="btn pri" @click="openAddForm">Add Google Form</button>
      </template>
    </div>
  </main>
</template>
<style scoped src="../assets/css/FormsList.css"></style>
