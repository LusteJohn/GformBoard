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

<style scoped>
.log{list-style:none;padding:0;margin:16px 0 0;display:flex;flex-direction:column;gap:8px}
.log li{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--bg);border:1px solid var(--bd);border-radius:8px;padding:9px 12px;font-size:14px}
</style>