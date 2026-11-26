<script setup>
import { computed } from 'vue'
import { form, state, toast } from '../store'
import { STATUSES } from '../data'
const r = computed(() => form.value.responses.find(x => x.id === state.openId))
const hasScore = computed(() => form.value.fields.some(f => f[0] === 'score'))
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

        <label>Status</label>
        <select v-model="r.status"><option v-for="s in STATUSES" :key="s">{{ s }}</option></select>

        <template v-if="hasScore">
          <label>Score</label>
          <input type="number" v-model="r.answers.score" />
        </template>

        <label>Feedback notes</label>
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