<script setup>
import { state, runUndo } from '../store'
import AppIcon from './AppIcon.vue'
const close = () => { state.activityOpen = false }
</script>
<template>
  <div class="shade" @click="close"></div>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Recent activity">
    <form class="modal-form" @submit.prevent="close">
      <header class="modal-head">
        <h2><AppIcon name="activity" :size="18" /> Recent activity</h2>
        <button type="button" class="x" aria-label="Close" @click="close"><AppIcon name="close" :size="20" /></button>
      </header>

      <div class="modal-body">
        <p class="mu small">Actions from this session. You can undo the latest ones.</p>
        <ul v-if="state.activity.length" class="log">
          <li v-for="a in state.activity" :key="a.id">
            <span>{{ a.msg }}</span>
            <button v-if="a.undo" type="button" class="btn small" @click="runUndo(a)">Undo</button>
          </li>
        </ul>
        <p v-else class="mu">No activity yet.</p>
      </div>

      <footer class="modal-foot">
        <button type="button" class="btn" @click="close">Cancel</button>
        <button type="submit" class="btn pri">Done</button>
      </footer>
    </form>
  </div>
</template>

<style scoped src="../assets/css/ActivityPanel.css"></style>