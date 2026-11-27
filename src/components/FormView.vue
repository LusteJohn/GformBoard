<script setup>
import { computed, ref } from 'vue'
import {
  form, state,
  groupField, groupOptions, hasFilters, resetFilters,
  bulkStatus, bulkScore, exportResponses, clearSelection, goToForms
} from '../store'
import { STATUSES } from '../data'
import BoardView from './BoardView.vue'
import TableView from './TableView.vue'
import InsightsView from './InsightsView.vue'
import AppIcon from './AppIcon.vue'

const tabs = [['board', 'Board', 'board'], ['table', 'Table', 'table'], ['insights', 'Insights', 'chart']]

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
    <nav class="crumbs">
      <button class="btn back" @click="goToForms"><AppIcon name="arrow-left" :size="16" /> All forms</button>
      <span class="sep">/</span>
      <span class="cur">{{ form.name }}</span>
    </nav>
    <div style="margin-top:14px">
      <h1>{{ form.name }}</h1>
      <span class="mu">{{ form.responses.length }} responses · {{ form.type }}</span>
      <div class="chips">
        <span class="chip-stat">{{ toReview }} to review</span>
        <span class="chip-stat">{{ gradedPct }}% graded</span>
        <span v-if="hasScore" class="chip-stat">Avg score {{ avg }}</span>
      </div>
    </div>

    <div v-if="state.tab === 'board' && total" class="hintbar">
      <AppIcon name="board" :size="16" />
      <span>Drag cards between columns to change status · Click a card to review &amp; leave notes.</span>
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
      <button v-for="[k, l, ic] in tabs" :key="k" class="tab" :class="{ on: state.tab === k }" @click="state.tab = k"><AppIcon :name="ic" :size="16" /> {{ l }}</button>
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
      <button class="btn" @click="exportResponses"><AppIcon name="download" :size="16" /> Export</button>
      <button class="btn" @click="clearSelection">Clear</button>
    </div>

    <BoardView v-if="state.tab === 'board'" />
    <TableView v-else-if="state.tab === 'table'" />
    <InsightsView v-else />
  </main>
</template>

<style scoped src="../assets/css/FormView.css"></style>