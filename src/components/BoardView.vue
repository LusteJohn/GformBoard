<script setup>
import { computed, ref } from 'vue'
import {
  form, state, label, statusClass, moveResponse,
  filteredResponses, toggleSelect, isSelected, hasFilters, resetFilters,
  isUrl, isEmptyVal, displayVal, isLongVal
} from '../store'
import { STATUSES } from '../data'
import AppIcon from './AppIcon.vue'

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
const hasScore = r => !isEmptyVal(r.answers.score)
const correctCount = r => r.correctCount || 0
</script>
<template>
  <div v-if="!byStatus" class="note">
    Grouped by “{{ label(form, form.layout.group) }}”. Dragging is only available when grouped by <b>Review status</b> — switch <b>Group by</b> in Customize to move cards between stages.
  </div>

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

  <div v-else class="board-wrap" :class="{ scrollable: columns.length > 3 }">
    <div v-if="byStatus" class="legend">
      <span v-for="s in STATUSES" :key="s" class="lg"><i :class="statusClass(s)"></i>{{ s }}</span>
    </div>
    <span v-if="columns.length > 3" class="scroll-hint">Scroll →</span>
    <div class="board" :class="{ locked: !byStatus }">
      <div v-for="c in columns" :key="c.name" class="col" :class="{ ov: overCol === c.name }"
           @dragover.prevent="byStatus && (overCol = c.name)" @dragleave="overCol = null" @drop.prevent="drop(c.name)">
        <h3><span>{{ c.name }}</span><span class="mu">{{ c.items.length }}</span></h3>
        <div v-for="r in c.items" :key="r.id" class="card" :class="{ on: isSelected(r.id) }" :draggable="byStatus"
             role="button" tabindex="0" :aria-label="`Open response: ${r.answers[form.layout.title]}`"
             @dragstart="dragId = r.id" @dragend="dragId = overCol = null"
             @click="state.openId = r.id" @keydown.enter.prevent="state.openId = r.id" @keydown.space.prevent="state.openId = r.id">
          <div class="card-top">
            <input type="checkbox" class="sel" :checked="isSelected(r.id)" @click.stop="toggleSelect(r.id)" />
            <b class="card-title">{{ displayVal(r.answers[form.layout.title]) }}</b>
            <span class="sp"></span>
            <span v-if="form.hasAnswerKey && correctCount(r)" class="badge ok" title="Correct answers"><AppIcon name="check" :size="12" /> {{ correctCount(r) }}</span>
            <span v-if="r.notes" class="badge note" title="Has feedback notes"><AppIcon name="note" :size="12" /> Note</span>
            <span v-if="hasScore(r)" class="badge score" title="Score"><AppIcon name="star" :size="12" /> {{ r.answers.score }}</span>
          </div>
          <div v-for="k in form.layout.show" :key="k" class="kv" :class="{ long: isLongVal(r.answers[k]) }">
            {{ label(form, k) }}:
            <a v-if="isUrl(r.answers[k])" class="val link" :href="r.answers[k]" target="_blank" rel="noopener">{{ r.answers[k] }}</a>
            <span v-else class="val" :class="{ empty: isEmptyVal(r.answers[k]) }">{{ displayVal(r.answers[k]) }}</span>
          </div>
          <span v-if="!byStatus" class="tag" :class="statusClass(r.status)">{{ r.status }}</span>
        </div>
        <div v-if="!c.items.length" class="col-empty">{{ byStatus ? 'Drop cards here' : 'No responses' }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped src="../assets/css/BoardView.css"></style>