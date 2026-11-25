<script setup>
import { computed } from 'vue'
import { form, state, toast } from '../store'
import { STATUSES } from '../data'
const r = computed(() => form.value.responses.find(x => x.id === state.openId))
const hasScore = computed(() => form.value.fields.some(f => f[0] === 'score'))
function save() { state.openId = null; toast('Review saved') }
</script>
<template>
  <div class="shade" @click="state.openId = null"></div>
  <aside class="side">
    <h2>{{ r.answers[form.layout.title] }}</h2>
    <div v-for="[k, t] in form.fields" :key="k" class="ans"><small>{{ t }}</small>{{ r.answers[k] }}</div>
    <label>Status</label>
    <select v-model="r.status"><option v-for="s in STATUSES" :key="s">{{ s }}</option></select>
    <template v-if="hasScore"><label>Score</label><input type="number" v-model="r.answers.score" /></template>
    <label>Feedback notes</label>
    <textarea rows="4" v-model="r.notes" placeholder="Write feedback for this student"></textarea>
    <button class="btn pri full" @click="save">Save review</button>
  </aside>
</template>
