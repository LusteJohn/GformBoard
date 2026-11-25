import { reactive, computed } from 'vue'
import { FORMS, STATUSES, NAME_POOL } from './data'

export const state = reactive({
  screen: 'login', // login | forms | form
  user: null,
  formId: null, tab: 'board',
  search: '', typeFilter: 'All',
  openId: null, customizing: false, toast: '',
  forms: structuredClone(FORMS),
})

export const form = computed(() => state.forms[state.formId])
export const label = (f, key) => f.fields.find(x => x[0] === key)?.[1] ?? key
export const statusClass = s => 's' + STATUSES.indexOf(s)

let timer
export function toast(msg) {
  state.toast = msg
  clearTimeout(timer)
  timer = setTimeout(() => (state.toast = ''), 1800)
}
export function openForm(id) { state.formId = id; state.tab = 'board'; state.screen = 'form' }
export function moveResponse(id, status) {
  form.value.responses.find(r => r.id === id).status = status
  toast('Moved to ' + status)
}
export function syncResponse() {
  const f = form.value, i = f.responses.length
  const answers = { ...f.responses[0].answers, name: NAME_POOL[(i * 5) % 12] }
  if ('score' in answers) answers.score = 12 + (i % 8)
  f.responses.push({ id: 'r' + i, notes: '', status: 'To review', answers })
  toast('1 new response synced from Google Forms')
}
