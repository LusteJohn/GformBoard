<script setup>
import { computed, ref } from 'vue'
import { form, label } from '../store'
import { STATUSES } from '../data'
import AppIcon from './AppIcon.vue'

// ---- respondents filter (search + status) ----
const search = ref('')
const statusFilter = ref('All')

const allResponses = computed(() => form.value.responses)
const respondents = computed(() => {
  const q = search.value.trim().toLowerCase()
  return allResponses.value.filter(r => {
    if (statusFilter.value !== 'All' && r.status !== statusFilter.value) return false
    if (!q) return true
    const hay = [r.answers[form.value.layout.title], ...Object.values(r.answers), r.notes].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

const rs = computed(() => respondents.value)
const total = computed(() => rs.value.length)
const totalAll = computed(() => allResponses.value.length)
const gradedCount = computed(() => rs.value.filter(r => r.status === 'Graded').length)
const graded = computed(() => total.value ? Math.round(gradedCount.value / total.value * 100) : 0)

const hasScore = computed(() => form.value.fields.some(f => f[0] === 'score'))
const scored = computed(() => rs.value.filter(r => {
  const v = r.answers.score
  return v !== undefined && v !== '' && !Number.isNaN(Number(v))
}))
const avg = computed(() => scored.value.length
  ? (scored.value.reduce((a, r) => a + Number(r.answers.score), 0) / scored.value.length).toFixed(1)
  : '—')

// ---- Quiz / answer-key scoring (dynamic: only when the form has an answer key) ----
const hasKey = computed(() => Boolean(form.value.hasAnswerKey))
const totalKeyed = computed(() => form.value.totalKeyed || 0)
const correctSum = computed(() => rs.value.reduce((a, r) => a + (r.correctCount || 0), 0))
const possibleSum = computed(() => total.value * totalKeyed.value)
const accuracy = computed(() => possibleSum.value ? Math.round(correctSum.value / possibleSum.value * 100) : 0)
const avgCorrect = computed(() => total.value ? (correctSum.value / total.value).toFixed(1) : '0')
// Per-question correct counts, for a simple bar list.
const perQuestion = computed(() => {
  const key = form.value.answerKey || {}
  return Object.entries(key).map(([qid, meta]) => {
    const c = rs.value.filter(r => {
      const v = r.answers[qid]
      return v !== undefined && v !== '' && isCorrectValue(meta.correct, v)
    }).length
    return { qid, title: meta.title, correct: c }
  })
})
function isCorrectValue(correct, val) {
  const n = String(val ?? '').trim().toLowerCase()
  if (n === '') return false
  return correct.some(c => String(c).trim().toLowerCase() === n)
}

const statusBars = computed(() => STATUSES.map(s => [s, rs.value.filter(r => r.status === s).length]))
const groupKey = computed(() => {
  const g = form.value.layout.group
  return g !== 'status' ? g : form.value.fields.find(f => ['section','grade','mood','consent'].includes(f[0]))?.[0]
})
const groupBars = computed(() => groupKey.value
  ? [...new Set(rs.value.map(r => r.answers[groupKey.value]))].map(v => [v, rs.value.filter(r => r.answers[groupKey.value] === v).length])
  : [])
// Guard against divide-by-zero when a form (or filtered view) has 0 responses.
const w = c => (total.value ? Math.max(4, c / total.value * 100) * 0.55 : 0) + '%'
const qw = c => (total.value ? Math.max(4, c / total.value * 100) * 0.55 : 0) + '%'

function clearFilters() { search.value = ''; statusFilter.value = 'All' }
</script>
<template>
  <div class="filters">
    <div class="search">
      <input v-model="search" placeholder="Search respondents ( / )" />
      <button v-if="search" class="clear" aria-label="Clear search" @click="search = ''">×</button>
    </div>
    <select v-model="statusFilter">
      <option value="All">All statuses</option>
      <option v-for="s in STATUSES" :key="s">{{ s }}</option>
    </select>
    <button v-if="search || statusFilter !== 'All'" class="btn" @click="clearFilters">Clear</button>
    <span class="count">{{ total }} of {{ totalAll }} respondents</span>
  </div>

  <div class="stats">
    <div class="st"><div class="n">{{ total }}</div><div class="mu">Responses</div></div>
    <div class="st"><div class="n">{{ graded }}%</div><div class="mu">Graded</div></div>
    <div v-if="hasScore" class="st"><div class="n">{{ avg }}</div><div class="mu">Average score</div></div>
    <template v-if="hasKey">
      <div class="st"><div class="n">{{ correctSum }}</div><div class="mu">Correct answers</div></div>
      <div class="st"><div class="n">{{ accuracy }}%</div><div class="mu">Accuracy</div></div>
      <div class="st"><div class="n">{{ avgCorrect }}</div><div class="mu">Avg correct / response</div></div>
    </template>
  </div>

  <div v-if="hasKey" class="stats">
    <div class="st">
      <b><AppIcon name="check" :size="15" /> Correct by question</b>
      <div v-for="q in perQuestion" :key="q.qid" class="br">
        <em :title="q.title">{{ q.title }}</em>
        <i :style="{ width: qw(q.correct) }"></i><b>{{ q.correct }}/{{ total }}</b>
      </div>
      <p v-if="!perQuestion.length" class="mu small">No answer key found.</p>
    </div>
  </div>

  <div class="stats">
    <div class="st"><b>By status</b>
      <div v-for="[l, c] in statusBars" :key="l" class="br"><em>{{ l }}</em><i :style="{ width: w(c) }"></i><b>{{ c }}</b></div>
    </div>
    <div v-if="groupBars.length" class="st"><b>By {{ label(form, groupKey).toLowerCase() }}</b>
      <div v-for="[l, c] in groupBars" :key="l" class="br"><em>{{ l }}</em><i :style="{ width: w(c) }"></i><b>{{ c }}</b></div>
    </div>
  </div>
</template>

<style scoped>
.filters{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0 4px}
.search{position:relative;flex:1;min-width:200px}
.search input{width:100%;padding:9px 34px 9px 12px;border:1px solid var(--bd);border-radius:8px;background:var(--sf)}
.search .clear{position:absolute;right:6px;top:50%;transform:translateY(-50%);border:0;background:none;color:var(--mu);font-size:16px;line-height:1;cursor:pointer;padding:2px 4px}
.filters select{padding:9px 12px;border:1px solid var(--bd);border-radius:8px;background:var(--sf)}
.count{color:var(--mu);font-size:13px;white-space:nowrap}
.st b{display:inline-flex;align-items:center;gap:6px}
.st b .ico{color:var(--ac)}
</style>