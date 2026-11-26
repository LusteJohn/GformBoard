<script setup>
import { computed } from 'vue'
import { form, label } from '../store'
import { STATUSES } from '../data'

const rs = computed(() => form.value.responses)
const total = computed(() => rs.value.length)
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
</script>
<template>
  <div class="stats">
    <div class="st"><div class="n">{{ total }}</div><div class="mu">Responses</div></div>
    <div class="st"><div class="n">{{ graded }}%</div><div class="mu">Graded</div></div>
    <div v-if="hasScore" class="st"><div class="n">{{ avg }}</div><div class="mu">Average score</div></div>
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