<script setup>
import { computed, ref } from 'vue'
import {
  form, state, label, statusClass, moveResponse,
  filteredResponses, toggleSelect, isSelected, syncResponse, hasFilters, resetFilters
} from '../store'
import { STATUSES } from '../data'

const byStatus = computed(() => form.value.layout.group === 'status')
const rows = computed(() => filteredResponses.value)
const columns = computed(() => {
  const g = form.value.layout.group, rs = rows.value
  const keys = byStatus.value ? STATUSES : [...new Set(rs.map(r => r.answers[g]))]
  return keys.map(k => ({ name: k, items: rs.filter(r => (byStatus.value ? r.status : r.answers[g]) === k) }))
})
const dragId = ref(null), overCol = ref(null)
function drop(col) {
  if (dragId.value && byStatus.value) moveResponse(dragId.value, col)
  dragId.value = overCol.value = null
}
const hasScore = r => r.answers.score !== undefined && r.answers.score !== ''
</script>
<template>
  <div v-if="!byStatus" class="note">
    Grouped by “{{ label(form, form.layout.group) }}”. Switch Group by to Review status in Customize to drag cards between stages.
  </div>

  <div v-if="!rows.length" class="empty">
    <p class="mu">{{ hasFilters ? 'No responses match your filters.' : 'No responses yet.' }}</p>
    <button v-if="!hasFilters" class="btn pri" @click="syncResponse">Sync a test response</button>
    <button v-else class="btn" @click="resetFilters">Clear filters</button>
  </div>

  <div v-else class="board">
    <div v-for="c in columns" :key="c.name" class="col" :class="{ ov: overCol === c.name }"
         @dragover.prevent="overCol = c.name" @dragleave="overCol = null" @drop.prevent="drop(c.name)">
      <h3><span>{{ c.name }}</span><span class="mu">{{ c.items.length }}</span></h3>
      <div v-for="r in c.items" :key="r.id" class="card" :class="{ on: isSelected(r.id) }" :draggable="byStatus"
           @dragstart="dragId = r.id" @dragend="dragId = overCol = null" @click="state.openId = r.id">
        <div class="card-top">
          <input type="checkbox" class="sel" :checked="isSelected(r.id)" @click.stop="toggleSelect(r.id)" />
          <b>{{ r.answers[form.layout.title] }}</b>
          <span class="sp"></span>
          <span v-if="r.notes" class="badge note" title="Has feedback notes">Note</span>
          <span v-if="hasScore(r)" class="badge score">{{ r.answers.score }}</span>
        </div>
        <div v-for="k in form.layout.show" :key="k" class="kv">{{ label(form, k) }}: <span>{{ r.answers[k] }}</span></div>
        <span v-if="!byStatus" class="tag" :class="statusClass(r.status)">{{ r.status }}</span>
      </div>
      <div v-if="!c.items.length" class="mu" style="padding:8px">Nothing here yet.</div>
    </div>
  </div>
</template>

<style scoped>
.card.on{border-color:var(--ac);box-shadow:0 0 0 1px var(--ac)}
.card-top{display:flex;align-items:center;gap:8px}
.card-top b{flex:1}
.sel{cursor:pointer;flex:none}
.badge{font-size:11px;font-weight:700;border-radius:6px;padding:2px 7px}
.badge.note{background:var(--acs);color:var(--ac)}
.badge.score{background:var(--c2);color:var(--t2)}
.empty{text-align:center;padding:40px 0}
.empty .btn{margin-top:8px}
</style>