<script setup>
import { computed, ref } from 'vue'
import { form, state, label, statusClass, moveResponse } from '../store'
import { STATUSES } from '../data'

const byStatus = computed(() => form.value.layout.group === 'status')
const columns = computed(() => {
  const g = form.value.layout.group, rs = form.value.responses
  const keys = byStatus.value ? STATUSES : [...new Set(rs.map(r => r.answers[g]))]
  return keys.map(k => ({ name: k, items: rs.filter(r => (byStatus.value ? r.status : r.answers[g]) === k) }))
})
const dragId = ref(null), overCol = ref(null)
function drop(col) {
  if (dragId.value && byStatus.value) moveResponse(dragId.value, col)
  dragId.value = overCol.value = null
}
</script>
<template>
  <div v-if="!byStatus" class="note">
    Grouped by “{{ label(form, form.layout.group) }}”. Switch Group by to Review status in Customize to drag cards between stages.
  </div>
  <div class="board">
    <div v-for="c in columns" :key="c.name" class="col" :class="{ ov: overCol === c.name }"
         @dragover.prevent="overCol = c.name" @dragleave="overCol = null" @drop.prevent="drop(c.name)">
      <h3><span>{{ c.name }}</span><span class="mu">{{ c.items.length }}</span></h3>
      <div v-for="r in c.items" :key="r.id" class="card" :draggable="byStatus"
           @dragstart="dragId = r.id" @dragend="dragId = overCol = null" @click="state.openId = r.id">
        <b>{{ r.answers[form.layout.title] }}</b>
        <div v-for="k in form.layout.show" :key="k" class="kv">{{ label(form, k) }}: <span>{{ r.answers[k] }}</span></div>
        <span v-if="!byStatus" class="tag" :class="statusClass(r.status)">{{ r.status }}</span>
      </div>
      <div v-if="!c.items.length" class="mu" style="padding:8px">Nothing here yet.</div>
    </div>
  </div>
</template>
