<script setup>
import { computed } from 'vue'
import { form, state, label, statusClass } from '../store'
const cols = computed(() => [form.value.layout.title, ...form.value.layout.show.filter(k => k !== form.value.layout.title)])
</script>
<template>
  <div class="tw">
    <table>
      <thead><tr><th v-for="k in cols" :key="k">{{ label(form, k) }}</th><th>Status</th></tr></thead>
      <tbody>
        <tr v-for="r in form.responses" :key="r.id" @click="state.openId = r.id">
          <td v-for="k in cols" :key="k">{{ r.answers[k] }}</td>
          <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
