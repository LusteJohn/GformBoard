<script setup>
import { state, addForm, closeAddForm } from '../store'
</script>

<template>
  <div class="shade" @click="closeAddForm"></div>
  <aside class="side">
    <h2>Add a Google Form</h2>
    <div class="mu small">These are the forms in your Google Drive. Click Add to manage one with FormBoard.</div>

    <div v-if="state.loadingDrive" class="mu">Loading your forms…</div>
    <div v-else-if="!state.driveForms.length" class="mu">
      No Google Forms found in your Drive. Create one at
      <a href="https://docs.google.com/forms/" target="_blank" rel="noopener">docs.google.com/forms</a>.
    </div>

    <ul v-else class="list">
      <li v-for="f in state.driveForms" :key="f.id">
        <span class="nm">{{ f.name }}</span>
        <button v-if="f.added" class="btn" disabled>Added</button>
        <button v-else class="btn pri" @click="addForm(f)">Add</button>
      </li>
    </ul>

    <button class="btn full" @click="closeAddForm">Done</button>
  </aside>
</template>

<style scoped>
.list{list-style:none;padding:0;margin:14px 0;display:flex;flex-direction:column;gap:8px;max-height:60vh;overflow:auto}
.list li{display:flex;align-items:center;gap:10px;border:1px solid var(--bd);border-radius:10px;padding:10px 12px;background:var(--sf)}
.nm{flex:1;font-weight:600}
.full{width:100%;margin-top:6px}
</style>