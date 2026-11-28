<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { form, state, toast, statusClass, isEmptyVal } from '../store'
import { STATUSES } from '../data'
import AppIcon from './AppIcon.vue'
const r = computed(() => form.value.responses.find(x => x.id === state.openId))
const hasKey = computed(() => Boolean(form.value.hasAnswerKey))
const totalKeyed = computed(() => form.value.totalKeyed || 0)
const correctCount = computed(() => r.value?.correctCount || 0)

// Per-question correctness for this response (only keyed questions).
const norm = v => String(v ?? '').trim().toLowerCase()
function isCorrectKey(qid, val) {
  const meta = form.value.answerKey?.[qid]
  if (!meta || isEmptyVal(val)) return null
  return meta.correct.some(c => norm(c) === norm(val))
}
const keyedFields = computed(() => (form.value.answerKey ? Object.keys(form.value.answerKey) : []))
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
const saving = ref(false)
function save() {
  if (saving.value) return
  saving.value = true
  setTimeout(() => { saving.value = false; state.openId = null; toast('Review saved') }, 250)
}

// Focus management: move focus into the dialog on open, trap Tab, restore on close.
const modalEl = ref(null)
let lastFocused = null
onMounted(() => {
  lastFocused = document.activeElement
  nextTick(() => {
    const el = modalEl.value?.querySelector('select, input, textarea')
      || modalEl.value?.querySelector('button')
    if (el && el.focus) el.focus()
  })
})
onUnmounted(() => {
  if (lastFocused && typeof lastFocused.focus === 'function') {
    try { lastFocused.focus() } catch { /* element gone */ }
  }
})
function onKeydown(e) {
  if (e.key === 'Escape') { e.stopPropagation(); close(); return }
  if (e.key !== 'Tab') return
  const nodes = modalEl.value?.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  if (!nodes || !nodes.length) return
  const list = Array.from(nodes).filter(n => n.offsetParent !== null)
  if (!list.length) return
  const first = list[0], last = list[list.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}
</script>
<template>
  <div class="shade" @click="close"></div>
  <div class="modal" ref="modalEl" role="dialog" aria-modal="true" aria-label="Review response" tabindex="-1" @keydown="onKeydown">
    <form class="modal-form" @submit.prevent="save">
      <header class="modal-head">
        <h2>{{ r.answers[form.layout.title] }}</h2>
        <button type="button" class="x" aria-label="Close" @click="close">×</button>
      </header>

      <div class="modal-body">
        <div v-if="hasKey" class="score-summary" :class="{ ok: correctCount === totalKeyed && totalKeyed }">
          <AppIcon :name="correctCount === totalKeyed && totalKeyed ? 'check' : 'star'" :size="16" />
          <b>{{ correctCount }}/{{ totalKeyed }} correct</b>
        </div>

        <div v-for="[k, t] in form.fields" :key="k" class="ans">
          <small>{{ t }}</small>
          <span class="ans-val">{{ r.answers[k] }}</span>
          <span v-if="keyedFields.includes(k)" class="mark" :class="isCorrectKey(k, r.answers[k]) ? 'ok' : 'bad'">
            <AppIcon :name="isCorrectKey(k, r.answers[k]) ? 'check' : 'close'" :size="13" />
            {{ isCorrectKey(k, r.answers[k]) ? 'Correct' : 'Wrong' }}
          </span>
        </div>

        <label><AppIcon name="check" :size="14" /> Status</label>
        <div class="status-pills">
          <button v-for="s in STATUSES" :key="s" type="button" class="pill" :class="[statusClass(s), { on: r.status === s }]" @click="r.status = s">{{ s }}</button>
        </div>

        <template v-if="hasScore">
          <label><AppIcon name="star" :size="14" /> {{ scoreLabel }}<span v-if="scoreMax != null" class="hint"> (0–{{ scoreMax }})</span></label>
          <input type="number" min="0" :max="scoreMax ?? undefined" :value="r.answers.score" @change="clampScore" />
        </template>

        <label><AppIcon name="note" :size="14" /> Feedback notes</label>
        <textarea rows="4" v-model="r.notes" placeholder="Write feedback for this student"></textarea>
      </div>

      <footer class="modal-foot">
        <button type="button" class="btn" @click="close">Cancel</button>
        <button type="submit" class="btn pri" :disabled="saving">{{ saving ? 'Saving…' : 'Save review' }}</button>
      </footer>
    </form>
  </div>
</template>

<style scoped src="../assets/css/DetailPanel.css"></style>