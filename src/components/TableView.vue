<script setup>
import { computed } from 'vue'
import {
  form, state, label, statusClass,
  filteredResponses, toggleSelect, isSelected, selectAll, clearSelection, hasFilters, resetFilters
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
    <template v-if="hasFilters">
      <p class="empty-title">No responses match your filters</p>
      <p class="mu small">Try a different search or clear the filters.</p>
      <button class="btn" @click="resetFilters">Clear filters</button>
    </template>
    <template v-else>
      <p class="empty-title">No responses yet</p>
      <p class="mu small">Share your form to start collecting responses.</p>
      <a v-if="form.link" class="btn pri" :href="form.link" target="_blank" rel="noopener">Open form</a>
    </template>
  </div>
  <div v-else class="tw">
    <table>
      <thead><tr>
        <th class="cbox"><input type="checkbox" :checked="allSelected" @change="toggleAll" /></th>
        <th v-for="k in cols" :key="k">{{ label(form, k) }}</th>
        <th>Status</th>
      </tr></thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id" :class="{ sel: isSelected(r.id) }" role="button" tabindex="0"
            :aria-label="`Open response: ${r.answers[form.layout.title]}`"
            @click="state.openId = r.id" @keydown.enter.prevent="state.openId = r.id" @keydown.space.prevent="state.openId = r.id">
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

<style scoped src="../assets/css/TableView.css"></style>