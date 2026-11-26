<script setup>
import { state, addForm, closeAddForm } from '../store'
import AppIcon from './AppIcon.vue'
</script>

<template>
  <div class="shade" @click="closeAddForm"></div>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Add a Google Form">
    <form class="modal-form" @submit.prevent="closeAddForm">
      <header class="modal-head">
        <h2>Add a Google Form</h2>
        <button type="button" class="x" aria-label="Close" @click="closeAddForm"><AppIcon name="close" :size="20" /></button>
      </header>

      <div class="modal-body">
        <p class="mu small">These are the forms in your Google Drive. Click Add to manage one with FormBoard.</p>

        <div v-if="state.loadingDrive" class="mu">Loading your forms…</div>
        <div v-else-if="!state.driveForms.length" class="mu">
          No Google Forms found in your Drive. Create one at
          <a href="https://docs.google.com/forms/" target="_blank" rel="noopener">docs.google.com/forms</a>.
        </div>

        <ul v-else class="list">
          <li v-for="f in state.driveForms" :key="f.id">
            <span class="nm"><AppIcon name="form" :size="16" /> {{ f.name }}</span>
            <button v-if="f.added" type="button" class="btn" disabled>Added</button>
            <button v-else type="button" class="btn pri" @click="addForm(f)">Add</button>
          </li>
        </ul>
      </div>

      <footer class="modal-foot">
        <button type="button" class="btn" @click="closeAddForm">Cancel</button>
        <button type="submit" class="btn pri">Done</button>
      </footer>
    </form>
  </div>
</template>

<style scoped src="../assets/css/AddFormPanel.css"></style>