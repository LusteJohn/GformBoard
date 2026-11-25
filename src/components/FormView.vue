<script setup>
import { form, state, syncResponse } from '../store'
import BoardView from './BoardView.vue'
import TableView from './TableView.vue'
import InsightsView from './InsightsView.vue'
const tabs = [['board', 'Board'], ['table', 'Table'], ['insights', 'Insights']]
defineExpose({ sync: syncResponse })
</script>
<template>
  <main class="wrap">
    <button class="btn" @click="state.screen = 'forms'">← All forms</button>
    <div style="margin-top:14px">
      <h1>{{ form.name }}</h1>
      <span class="mu">{{ form.responses.length }} responses · {{ form.type }}</span>
    </div>
    <div class="tabs">
      <button v-for="[k, l] in tabs" :key="k" class="tab" :class="{ on: state.tab === k }" @click="state.tab = k">{{ l }}</button>
    </div>
    <BoardView v-if="state.tab === 'board'" />
    <TableView v-else-if="state.tab === 'table'" />
    <InsightsView v-else />
  </main>
</template>
