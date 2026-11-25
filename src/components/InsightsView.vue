<script setup>
import { computed } from 'vue'
import { form, label } from '../store'
import { STATUSES } from '../data'

const rs = computed(() => form.value.responses)
const total = computed(() => rs.value.length)
const graded = computed(() => Math.round(rs.value.filter(r => r.status === 'Graded').length / total.value * 100))
const hasScore = computed(() => form.value.fields.some(f => f[0] === 'score'))
const avg = computed(() => (rs.value.reduce((a, r) => a + Number(r.answers.score), 0) / total.value).toFixed(1))
const statusBars = computed(() => STATUSES.map(s => [s, rs.value.filter(r => r.status === s).length]))
const groupKey = computed(() => {
  const g = form.value.layout.group
  return g !== 'status' ? g : form.value.fields.find(f => ['section','grade','mood','consent'].includes(f[0]))?.[0]
})
const groupBars = computed(() => groupKey.value
  ? [...new Set(rs.value.map(r => r.answers[groupKey.value]))].map(v => [v, rs.value.filter(r => r.answers[groupKey.value] === v).length])
  : [])
const w = c => Math.max(4, c / total.value * 100) * 0.55 + '%'
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
