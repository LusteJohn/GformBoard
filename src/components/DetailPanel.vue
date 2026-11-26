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

<style scoped>
.modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:20;width:min(520px,92vw);max-height:86vh;background:var(--sf);border:1px solid var(--bd);border-radius:14px;box-shadow:0 18px 60px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden}
.modal-form{display:flex;flex-direction:column;min-height:0}
.modal-head{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--bd)}
.modal-head h2{margin:0;font-size:19px;flex:1;overflow:hidden;text-overflow:ellipsis}
.x{border:0;background:none;font-size:24px;line-height:1;color:var(--mu);padding:0 4px;cursor:pointer}
.x:hover{color:var(--tx)}
.modal-body{padding:6px 18px 16px;overflow-y:auto}
.modal-body .ans{padding:9px 0;border-bottom:1px solid var(--bd)}
.modal-body .ans small{color:var(--mu);display:block}
.modal-body label{display:block;font-weight:600;font-size:13px;margin:14px 0 5px}
.modal-body select,.modal-body input[type=number],.modal-body textarea{width:100%;padding:8px 10px;border:1px solid var(--bd);border-radius:8px;background:var(--bg)}
.modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--bd);background:var(--sf)}
</style>