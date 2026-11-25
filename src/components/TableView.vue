<script setup>
import { computed } from 'vue'
import {
  form, state, label, statusClass,
  filteredResponses, toggleSelect, isSelected, selectAll, clearSelection, syncResponse, hasFilters, resetFilters
} from '../store'

const cols = computed(() => [form.value.layout.title, ...form.value.layout.show.filter(k => k !== form.value.layout.title)])
const rows = computed(() => filteredResponses.value)
const allSelected = computed(() => rows.value.length > 0 && rows.value.every(r => isSelected(r.id)))
function toggleAll() {
  if (allSelected.value) clearSelection()
  else selectAll(rows.value.map(r => r.id))
}
const hasScore = r => r.answers.score !== undefined && r.answers.score !== ''
</script>
<template>
  <div v-if="!rows.length" class="empty">
    <p class="mu">{{ hasFilters ? 'No responses match your filters.' : 'No responses yet.' }}</p>
    <button v-if="!hasFilters" class="btn pri" @click="syncResponse">Sync a test response</button>
    <button v-else class="btn" @click="resetFilters">Clear filters</button>
  </div>
  <div v-else class="tw">
    <table>
      <thead><tr>
        <th class="cbox"><input type="checkbox" :checked="allSelected" @change="toggleAll" /></th>
        <th v-for="k in cols" :key="k">{{ label(form, k) }}</th>
        <th>Status</th>
      </tr></thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id" :class="{ sel: isSelected(r.id) }" @click="state.openId = r.id">
          <td class="cbox" @click.stop><input type="checkbox" :checked="isSelected(r.id)" @change="toggleSelect(r.id)" /></td>
          <td v-for="k in cols" :key="k">
            {{ r.answers[k] }}
            <span v-if="k === 'score' && hasScore(r)" class="badge score">{{ r.answers[k] }}</span>
          </td>
          <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.cbox{width:34px;text-align:center}
tr.sel{background:var(--acs)}
.badge.score{background:var(--c2);color:var(--t2);font-size:11px;font-weight:700;border-radius:6px;padding:2px 7px;margin-left:6px}
.empty{text-align:center;padding:40px 0}
.empty .btn{margin-top:8px}
</style>