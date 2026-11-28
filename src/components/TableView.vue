<script setup>
import { computed, ref } from 'vue'
import {
  form, state, label, statusClass,
  filteredResponses, toggleSelect, isSelected, selectAll, clearSelection, hasFilters, resetFilters,
  isUrl, isEmptyVal, displayVal, isLongVal
} from '../store'
import AppIcon from './AppIcon.vue'

// Dynamic header: title column + configured card fields + (quiz) correct + Status.
const cols = computed(() => [form.value.layout.title, ...form.value.layout.show.filter(k => k !== form.value.layout.title)])
const rows = computed(() => filteredResponses.value)
const allSelected = computed(() => rows.value.length > 0 && rows.value.every(r => isSelected(r.id)))
function toggleAll() {
  if (allSelected.value) clearSelection()
  else selectAll(rows.value.map(r => r.id))
}
const hasScore = r => !isEmptyVal(r.answers.score)
const correctCount = r => r.correctCount || 0

// ---- Answer-key modal (quizzes / forms with keyed questions) ----
const keyOpen = ref(false)
const keyItems = computed(() => {
  const key = form.value.answerKey || {}
  return Object.entries(key).map(([qid, meta]) => {
    const responses = rows.value
      .filter(r => !isEmptyVal(r.answers[qid]))
      .map(r => ({ id: r.id, name: r.answers[form.value.layout.title] || r.id, value: r.answers[qid] }))
    return { qid, title: meta.title, correct: meta.correct, responses }
  })
})
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
        <th v-if="form.hasAnswerKey" class="key-col">
          <button class="key-more" title="View answer key &amp; responses" @click="keyOpen = true"><AppIcon name="more" :size="16" /></button>
        </th>
        <th>Status</th>
      </tr></thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id" :class="{ sel: isSelected(r.id) }" role="button" tabindex="0"
            :aria-label="`Open response: ${r.answers[form.layout.title]}`"
            @click="state.openId = r.id" @keydown.enter.prevent="state.openId = r.id" @keydown.space.prevent="state.openId = r.id">
          <td class="cbox" @click.stop><input type="checkbox" :checked="isSelected(r.id)" @change="toggleSelect(r.id)" /></td>
          <td v-for="k in cols" :key="k" class="cell" :class="{ long: isLongVal(r.answers[k]) }" :title="displayVal(r.answers[k])">
            <a v-if="isUrl(r.answers[k])" class="link" :href="r.answers[k]" target="_blank" rel="noopener" @click.stop>{{ r.answers[k] }}</a>
            <span v-else class="val" :class="{ empty: isEmptyVal(r.answers[k]) }">{{ displayVal(r.answers[k]) }}</span>
            <span v-if="k === 'score' && hasScore(r)" class="badge score">{{ r.answers[k] }}</span>
          </td>
          <td v-if="form.hasAnswerKey" class="key-cell">
            <span class="badge ok" title="Correct answers"><AppIcon name="check" :size="12" /> {{ correctCount(r) }}/{{ form.totalKeyed }}</span>
          </td>
          <td class="status-cell">
            <span class="tag" :class="statusClass(r.status)">{{ r.status }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Answer-key modal -->
  <div v-if="keyOpen" class="key-wrap">
    <div class="shade" @click="keyOpen = false"></div>
    <div class="modal" role="dialog" aria-modal="true" aria-label="Answer key and responses">
      <form class="modal-form" @submit.prevent="keyOpen = false">
        <header class="modal-head">
          <h2>Answer key &amp; responses</h2>
          <button type="button" class="x" aria-label="Close" @click="keyOpen = false"><AppIcon name="close" :size="20" /></button>
        </header>
        <div class="modal-body">
          <p v-if="!keyItems.length" class="mu">No answer key found for this form.</p>
          <section v-for="q in keyItems" :key="q.qid" class="qk">
            <div class="qk-head">
              <b>{{ q.title }}</b>
              <span class="correct">Correct: {{ q.correct.join(', ') }}</span>
            </div>
            <ul class="qres">
              <li v-for="resp in q.responses" :key="resp.id">
                <span class="who">{{ resp.name }}</span>
                <span class="ans" :class="{ ok: q.correct.map(c => String(c).toLowerCase()).includes(String(resp.value).toLowerCase()) }">{{ resp.value }}</span>
              </li>
              <li v-if="!q.responses.length" class="mu small">No responses.</li>
            </ul>
          </section>
        </div>
        <footer class="modal-foot">
          <button type="button" class="btn" @click="keyOpen = false">Close</button>
          <button type="submit" class="btn pri">Done</button>
        </footer>
      </form>
    </div>
  </div>
</template>

<style scoped src="../assets/css/TableView.css"></style>