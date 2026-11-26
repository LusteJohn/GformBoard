<script setup>
import { computed } from 'vue'
import { form, state, toast } from '../store'
import { STATUSES } from '../data'
import AppIcon from './AppIcon.vue'
const r = computed(() => form.value.responses.find(x => x.id === state.openId))
const scoreField = computed(() => form.value.fields.find(f => f[0] === 'score'))
const hasScore = computed(() => Boolean(scoreField.value))
const scoreLabel = computed(() => scoreField.value?.[1] || 'Score')
// Max comes from a "/20" or "/50" declared in the field label, if present.
const scoreMax = computed(() => {
  const m = /\/(\d+)/.exec(scoreField.value?.[1] || '')
  return m ? Number(m[1]) : null
})
function clampScore(e) {
  const raw = e.target.value
  if (raw === '') { r.value.answers.score = ''; return }
  let v = Number(raw)
  if (Number.isNaN(v)) v = 0
  v = Math.max(0, v)
  if (scoreMax.value != null) v = Math.min(v, scoreMax.value)
  r.value.answers.score = v
  e.target.value = v
}
const close = () => { state.openId = null }
function save() { state.openId = null; toast('Review saved') }
</script>
<template>
  <div class="shade" @click="close"></div>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Review response">
    <form class="modal-form" @submit.prevent="save">
      <header class="modal-head">
        <h2>{{ r.answers[form.layout.title] }}</h2>
        <button type="button" class="x" aria-label="Close" @click="close">×</button>
      </header>

      <div class="modal-body">
        <div v-for="[k, t] in form.fields" :key="k" class="ans"><small>{{ t }}</small>{{ r.answers[k] }}</div>

        <label><AppIcon name="check" :size="14" /> Status</label>
        <select v-model="r.status"><option v-for="s in STATUSES" :key="s">{{ s }}</option></select>

        <template v-if="hasScore">
          <label><AppIcon name="star" :size="14" /> {{ scoreLabel }}<span v-if="scoreMax != null" class="hint"> (0–{{ scoreMax }})</span></label>
          <input type="number" min="0" :max="scoreMax ?? undefined" :value="r.answers.score" @change="clampScore" />
        </template>

        <label><AppIcon name="note" :size="14" /> Feedback notes</label>
        <textarea rows="4" v-model="r.notes" placeholder="Write feedback for this student"></textarea>
      </div>

      <footer class="modal-foot">
        <button type="button" class="btn" @click="close">Cancel</button>
        <button type="submit" class="btn pri">Save review</button>
      </footer>
    </form>
  </div>
</template>

<style scoped src="../assets/css/DetailPanel.css"></style>