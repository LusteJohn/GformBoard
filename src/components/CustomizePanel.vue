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

<style scoped src="../assets/css/CustomizePanel.css"></style>