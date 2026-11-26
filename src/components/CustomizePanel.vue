<script setup>
import { form, state } from '../store'
const skip = ['name', 'q1', 'essay', 'comment', 'student', 'score'] // free-text/unique fields make poor columns
const close = () => { state.customizing = false }
</script>
<template>
  <div class="shade" @click="close"></div>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Customize this form">
    <form class="modal-form" @submit.prevent="close">
      <header class="modal-head">
        <h2>Customize this form</h2>
        <button type="button" class="x" aria-label="Close" @click="close">×</button>
      </header>

      <div class="modal-body">
        <p class="mu small">Your choices are saved per form, so each template stays the way you set it.</p>

        <label>Card title</label>
        <select v-model="form.layout.title">
          <option v-for="[k, t] in form.fields" :key="k" :value="k">{{ t }}</option>
        </select>

        <label>Group board by</label>
        <select v-model="form.layout.group">
          <option value="status">Review status</option>
          <option v-for="[k, t] in form.fields.filter(f => !skip.includes(f[0]))" :key="k" :value="k">{{ t }}</option>
        </select>

        <label>Fields shown on cards and table</label>
        <div class="checks">
          <label v-for="[k, t] in form.fields" :key="k" class="ck">
            <input type="checkbox" :value="k" v-model="form.layout.show" /> {{ t }}
          </label>
        </div>
      </div>

      <footer class="modal-foot">
        <button type="button" class="btn" @click="close">Cancel</button>
        <button type="submit" class="btn pri">Done</button>
      </footer>
    </form>
  </div>
</template>

<style scoped>
.modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:20;width:min(520px,92vw);max-height:86vh;background:var(--sf);border:1px solid var(--bd);border-radius:14px;box-shadow:0 18px 60px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden}
.modal-form{display:flex;flex-direction:column;min-height:0}
.modal-head{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--bd)}
.modal-head h2{margin:0;font-size:19px;flex:1}
.x{border:0;background:none;font-size:24px;line-height:1;color:var(--mu);padding:0 4px;cursor:pointer}
.x:hover{color:var(--tx)}
.modal-body{padding:6px 18px 16px;overflow-y:auto}
.modal-body label{display:block;font-weight:600;font-size:13px;margin:14px 0 5px}
.modal-body select{width:100%;padding:8px 10px;border:1px solid var(--bd);border-radius:8px;background:var(--bg)}
.checks{max-height:34vh;overflow-y:auto;border:1px solid var(--bd);border-radius:10px;padding:6px 10px;background:var(--bg)}
.modal-body .ck{display:flex;gap:8px;align-items:center;padding:5px 0;font-weight:400;font-size:14px;margin:0}
.modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--bd);background:var(--sf)}
</style>