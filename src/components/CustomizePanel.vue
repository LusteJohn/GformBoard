<script setup>
import { form, state } from '../store'
const skip = ['name', 'q1', 'essay', 'comment', 'student', 'score'] // free-text/unique fields make poor columns
</script>
<template>
  <div class="shade" @click="state.customizing = false"></div>
  <aside class="side">
    <h2>Customize this form</h2>
    <div class="mu small">Your choices are saved per form, so each template stays the way you set it.</div>
    <label>Card title</label>
    <select v-model="form.layout.title"><option v-for="[k, t] in form.fields" :key="k" :value="k">{{ t }}</option></select>
    <label>Group board by</label>
    <select v-model="form.layout.group">
      <option value="status">Review status</option>
      <option v-for="[k, t] in form.fields.filter(f => !skip.includes(f[0]))" :key="k" :value="k">{{ t }}</option>
    </select>
    <label>Fields shown on cards and table</label>
    <label v-for="[k, t] in form.fields" :key="k" class="ck"><input type="checkbox" :value="k" v-model="form.layout.show" /> {{ t }}</label>
    <button class="btn pri full" @click="state.customizing = false">Done</button>
  </aside>
</template>
