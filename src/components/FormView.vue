<script setup>
import { computed, ref } from 'vue'
import {
  form, state,
  groupField, groupOptions, hasFilters, resetFilters,
  bulkStatus, bulkScore, exportResponses, clearSelection
} from '../store'
import { STATUSES } from '../data'
import BoardView from './BoardView.vue'
import TableView from './TableView.vue'
import InsightsView from './InsightsView.vue'

const tabs = [['board', 'Board'], ['table', 'Table'], ['insights', 'Insights']]

const rs = computed(() => form.value.responses)
const total = computed(() => rs.value.length)
const toReview = computed(() => rs.value.filter(r => r.status === 'To review').length)
const gradedPct = computed(() => total.value ? Math.round(rs.value.filter(r => r.status === 'Graded').length / total.value * 100) : 0)
const hasScore = computed(() => form.value.fields.some(f => f[0] === 'score'))
const avg = computed(() => {
  const scored = rs.value.filter(r => r.answers.score !== undefined && r.answers.score !== '')
  if (!scored.length) return '—'
  return (scored.reduce((a, r) => a + Number(r.answers.score), 0) / scored.length).toFixed(1)
})

const selCount = computed(() => state.selected.length)
const bulkScoreVal = ref('')
function applyScore() {
  bulkScore(bulkScoreVal.value)
  bulkScoreVal.value = ''
}
</script>
<template>
  <main class="wrap">
    <button class="btn" @click="state.screen = 'forms'">← All forms</button>
    <div style="margin-top:14px">
      <h1>{{ form.name }}</h1>
      <span class="mu">{{ form.responses.length }} responses · {{ form.type }}</span>
      <div class="chips">
        <span class="chip-stat">{{ toReview }} to review</span>
        <span class="chip-stat">{{ gradedPct }}% graded</span>
        <span v-if="hasScore" class="chip-stat">Avg score {{ avg }}</span>
      </div>
    </div>

    <div class="filters">
      <input id="response-search" v-model="state.responseSearch" placeholder="Search responses ( / )" />
      <select v-model="state.statusFilter">
        <option value="All">All statuses</option>
        <option v-for="s in STATUSES" :key="s">{{ s }}</option>
      </select>
      <select v-if="groupField" v-model="state.groupFilter">
        <option value="All">All {{ groupField }}</option>
        <option v-for="o in groupOptions" :key="o">{{ o }}</option>
      </select>
      <button v-if="hasFilters" class="btn" @click="resetFilters">Clear</button>
    </div>

    <div class="tabs">
      <button v-for="[k, l] in tabs" :key="k" class="tab" :class="{ on: state.tab === k }" @click="state.tab = k">{{ l }}</button>
    </div>

    <div v-if="selCount" class="bulkbar">
      <b>{{ selCount }} selected</b>
      <select @change="bulkStatus($event.target.value); $event.target.value = ''">
        <option value="" disabled>Set status…</option>
        <option v-for="s in STATUSES" :key="s">{{ s }}</option>
      </select>
      <template v-if="hasScore">
        <input v-model="bulkScoreVal" type="number" placeholder="Score" />
        <button class="btn" @click="applyScore">Assign score</button>
      </template>
      <button class="btn" @click="exportResponses">Export</button>
      <button class="btn" @click="clearSelection">Clear</button>
    </div>

    <BoardView v-if="state.tab === 'board'" />
    <TableView v-else-if="state.tab === 'table'" />
    <InsightsView v-else />
  </main>
</template>

<style scoped>
.chips{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.chip-stat{background:var(--sf);border:1px solid var(--bd);border-radius:99px;padding:4px 12px;font-size:13px;font-weight:600}
.filters{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
.filters input{flex:1;min-width:180px;padding:9px 12px;border:1px solid var(--bd);border-radius:8px;background:var(--sf)}
.filters select{padding:9px 12px;border:1px solid var(--bd);border-radius:8px;background:var(--sf)}
.bulkbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:var(--acs);border:1px solid var(--bd);border-radius:10px;padding:10px 14px;margin-bottom:14px}
.bulkbar select,.bulkbar input{padding:7px 10px;border:1px solid var(--bd);border-radius:8px;background:var(--sf)}
.bulkbar input{width:90px}
</style>