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

<style scoped src="../assets/css/AddFormPanel.css"></style>