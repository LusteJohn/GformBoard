<script setup>
import { state } from './store'
import Login from './components/Login.vue'
import FormsList from './components/FormsList.vue'
import FormView from './components/FormView.vue'
import CustomizePanel from './components/CustomizePanel.vue'
import DetailPanel from './components/DetailPanel.vue'
</script>

<template>
  <Login v-if="state.screen === 'login'" />
  <template v-else>
    <header class="top">
      <span class="logo">FormBoard</span><span class="sp"></span>
      <template v-if="state.screen === 'form'">
        <button class="btn" @click="$refs.fv.sync()">Sync responses</button>
        <button class="btn" @click="state.customizing = true">Customize</button>
      </template>
      <span class="mu small">ms.garcia@school.edu</span>
      <div class="av">MG</div>
      <button class="btn" @click="state.screen = 'login'">Sign out</button>
    </header>
    <FormsList v-if="state.screen === 'forms'" />
    <FormView v-else ref="fv" />
    <CustomizePanel v-if="state.customizing" />
    <DetailPanel v-if="state.openId" />
  </template>
  <div v-if="state.toast" class="toast">{{ state.toast }}</div>
</template>
