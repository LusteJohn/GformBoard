import { reactive, computed } from 'vue'
import { FORMS, STATUSES, NAME_POOL } from './data'

export const state = reactive({
  screen: 'login', // login | forms | form
  user: null,
  authReady: false,
  formId: null, tab: 'board',
  search: '', typeFilter: 'All',
  responseSearch: '', statusFilter: 'All', groupFilter: 'All',
  selected: [],
  openId: null, customizing: false, activityOpen: false,
  toast: '', toastAction: null,
  activity: [],
  forms: structuredClone(FORMS),
})

export const form = computed(() => state.forms[state.formId])
export const label = (f, key) => f.fields.find(x => x[0] === key)?.[1] ?? key
export const statusClass = s => 's' + STATUSES.indexOf(s)

// A non-status field usable for the section/grade/mood filter
export const groupField = computed(() => {
  const f = form.value
  if (!f) return null
  return f.fields.find(x => ['section', 'grade', 'mood', 'consent'].includes(x[0]))?.[0] || null
})
export const groupOptions = computed(() => {
  const k = groupField.value
  if (!k) return []
  return [...new Set(form.value.responses.map(r => r.answers[k]))]
})

// Responses filtered by in-form search + status + group filters
export const filteredResponses = computed(() => {
  const f = form.value
  if (!f) return []
  const q = state.responseSearch.trim().toLowerCase()
  return f.responses.filter(r => {
    if (state.statusFilter !== 'All' && r.status !== state.statusFilter) return false
    if (groupField.value && state.groupFilter !== 'All' && r.answers[groupField.value] !== state.groupFilter) return false
    if (!q) return true
    const hay = [r.answers[f.layout.title], ...Object.values(r.answers), r.notes].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

export function resetFilters() {
  state.responseSearch = ''
  state.statusFilter = 'All'
  state.groupFilter = 'All'
}
export const hasFilters = computed(() =>
  !!state.responseSearch || state.statusFilter !== 'All' || state.groupFilter !== 'All')

// ---- selection ----
export const isSelected = id => state.selected.includes(id)
export function toggleSelect(id) {
  const i = state.selected.indexOf(id)
  if (i >= 0) state.selected.splice(i, 1)
  else state.selected.push(id)
}
export function selectAll(ids) { state.selected = ids.slice() }
export function clearSelection() { state.selected = [] }

// ---- toast + activity log ----
let toastTimer
export function notify(msg, action) {
  state.toast = msg
  state.toastAction = action || null
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { state.toast = ''; state.toastAction = null }, action ? 5000 : 1800)
}
export function toast(msg) { notify(msg) }
export function runToastAction() {
  const a = state.toastAction
  state.toast = ''
  state.toastAction = null
  if (a) a.fn()
}
export function logActivity(msg, undo) {
  state.activity.unshift({ id: Date.now() + Math.random(), msg, undo })
  if (state.activity.length > 20) state.activity.pop()
}
export function runUndo(entry) {
  if (!entry) return
  if (entry.undo) entry.undo()
  state.activity = state.activity.filter(a => a !== entry)
  notify('Change undone')
}

export function openForm(id) {
  state.formId = id
  state.tab = 'board'
  state.selected = []
  resetFilters()
  state.screen = 'form'
}

export function moveResponse(id, status) {
  const f = form.value
  const r = f.responses.find(x => x.id === id)
  if (!r || r.status === status) return
  const prev = r.status
  const name = r.answers[f.layout.title]
  r.status = status
  const undo = () => { r.status = prev }
  logActivity(`Moved “${name}” to ${status}`, undo)
  notify(`Moved to ${status}`, { label: 'Undo', fn: () => { undo(); notify('Move undone') } })
}

export function syncResponse() {
  const f = form.value, i = f.responses.length
  if (!f.responses.length) return
  const answers = { ...f.responses[0].answers, name: NAME_POOL[(i * 5) % 12] }
  if ('score' in answers) answers.score = 12 + (i % 8)
  f.responses.push({ id: 'r' + i, notes: '', status: 'To review', answers })
  logActivity('Synced a new response from Google Forms')
  notify('1 new response synced from Google Forms')
}

// ---- bulk actions ----
const selectedResponses = () => form.value.responses.filter(r => state.selected.includes(r.id))

export function bulkStatus(status) {
  const rs = selectedResponses()
  if (!rs.length) return
  const prev = rs.map(r => r.status)
  rs.forEach(r => r.status = status)
  const undo = () => rs.forEach((r, i) => r.status = prev[i])
  logActivity(`Set ${rs.length} response${rs.length > 1 ? 's' : ''} to ${status}`, undo)
  notify(`Updated ${rs.length} response${rs.length > 1 ? 's' : ''}`, { label: 'Undo', fn: () => { undo(); notify('Change undone') } })
  clearSelection()
}

export function bulkScore(score) {
  const rs = selectedResponses()
  if (!rs.length || score === '' || score == null) return
  const prev = rs.map(r => r.answers.score)
  const n = Number(score)
  rs.forEach(r => r.answers.score = n)
  const undo = () => rs.forEach((r, i) => r.answers.score = prev[i])
  logActivity(`Assigned score ${n} to ${rs.length} response${rs.length > 1 ? 's' : ''}`, undo)
  notify(`Scored ${rs.length} response${rs.length > 1 ? 's' : ''}`, { label: 'Undo', fn: () => { undo(); notify('Change undone') } })
  clearSelection()
}

export function exportResponses() {
  const f = form.value
  const chosen = selectedResponses()
  const list = chosen.length ? chosen : filteredResponses.value
  if (!list.length) return
  const cols = f.fields.map(x => x[0])
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = ['id', ...cols, 'status', 'notes'].map(esc).join(',')
  const rows = list.map(r => [r.id, ...cols.map(k => r.answers[k]), r.status, r.notes].map(esc).join(','))
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = f.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-responses.csv'
  a.click()
  URL.revokeObjectURL(url)
  notify(`Exported ${list.length} response${list.length > 1 ? 's' : ''}`)
}