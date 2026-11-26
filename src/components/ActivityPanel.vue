<script setup>
import { state, runUndo } from '../store'
</script>
<template>
  <div class="shade" @click="state.activityOpen = false"></div>
  <aside class="side">
    <h2>Recent activity</h2>
    <div class="mu small">Actions from this session. You can undo the latest ones.</div>
    <ul v-if="state.activity.length" class="log">
      <li v-for="a in state.activity" :key="a.id">
        <span>{{ a.msg }}</span>
        <button v-if="a.undo" class="btn small" @click="runUndo(a)">Undo</button>
      </li>
    </ul>
    <p v-else class="mu">No activity yet.</p>
  </aside>
</template>

<style scoped src="../assets/css/ActivityPanel.css"></style>