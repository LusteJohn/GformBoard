import { reactive, computed, watch } from 'vue'
import { STATUSES } from './data'
import { getToken, clearToken } from './services/authService'
import { loadMyForms, addGoogleForm, getDriveForms } from './services/forms'
import { newResponseId } from './utils'

export const state = reactive({
  screen: 'login', // login | forms | form
  user: null,
  authReady: false,
  loadingForms: false,
  pickerOpen: false,
  loadingDrive: false,
  driveForms: [],
  formId: null, tab: 'board',
  search: '', typeFilter: 'All',
  responseSearch: '', statusFilter: 'All', groupFilter: 'All',
  selected: [],
  openId: null, customizing: false, activityOpen: false,
  toast: '', toastAction: null,
  activity: [],
  forms: {},
})

export const form = computed(() => state.forms[state.formId])
export const label = (f, key) => f.fields.find(x => x[0] === key)?.[1] ?? key
export const statusClass = s => 's' + STATUSES.indexOf(s)

// ---- local persistence (prototype) ----
// The live data always comes from Google/Firestore, but the teacher's layout
// choices and review deltas (status/notes/score) are mirrored to localStorage so
// a refresh feels real instead of resetting everything.
const LS_KEY = 'formboard_local_v1'

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {} }
  catch { return {} }
}
function writeLocal(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)) }
  catch { /* storage full / unavailable */ }
}

/** Extracts only the mutable deltas (layout + per-response review fields). */
function extractPersistable() {
  const layouts = {}, reviews = {}
  for (const [id, f] of Object.entries(state.forms)) {
    if (f.layout) layouts[id] = f.layout
    const rv = {}
    for (const r of f.responses) {
      const d = {}
      if (r.status) d.status = r.status
      if (r.notes) d.notes = r.notes
      if (r.answers && r.answers.score !== undefined && r.answers.score !== '') d.score = r.answers.score
      if (Object.keys(d).length) rv[r.id] = d
    }
    if (Object.keys(rv).length) reviews[id] = rv
  }
  return { layouts, reviews }
}

/** Overlays locally-persisted layout/review deltas onto freshly loaded forms. */
function applyLocal(forms) {
  const { layouts = {}, reviews = {} } = readLocal()
  for (const [id, f] of Object.entries(forms)) {
    if (layouts[id] && f.layout) f.layout = { ...f.layout, ...layouts[id] }
    const rv = reviews[id]
    if (rv) {
      for (const r of f.responses) {
        const d = rv[r.id]
        if (!d) continue
        if (d.status) r.status = d.status
        if (d.notes != null) r.notes = d.notes
        if (d.score != null && r.answers) r.answers.score = d.score
      }
    }
  }
  return forms
}

let persistTimer
function schedulePersist() {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => writeLocal(extractPersistable()), 250)
}

// Any deep change to the loaded forms (layout edits, status/notes/score) is persisted.
watch(() => state.forms, schedulePersist, { deep: true })

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

// ---- Google Forms loading ----
const isExpiredToken = e => /401|invalid_token|expired|invalid credentials/i.test(e?.message || '')

/** Reads the signed-in user's saved forms live from Google into state.forms. */
export async function refreshForms() {
  if (!state.user) return
  const token = getToken()
  if (!token) { state.forms = {}; return }
  state.loadingForms = true
  try {
    state.forms = applyLocal(await loadMyForms(state.user, token))
  } catch (e) {
    console.error('Failed to load forms:', e)
    if (isExpiredToken(e)) { clearToken(); notify('Session expired. Please sign in with Google again.') }
    else notify('Could not load your forms. Please sign in with Google again.')
  } finally {
    state.loadingForms = false
  }
}

/** Opens the add-form panel and lists the user's Drive forms (no Picker/API key). */
export async function openAddForm() {
  if (!state.user) return
  const token = getToken()
  if (!token) { notify('Sign in with Google to add forms from Drive.'); return }
  state.pickerOpen = true
  state.loadingDrive = true
  state.driveForms = []
  try {
    const drive = await getDriveForms(token)
    const existing = new Set(Object.keys(state.forms))
    state.driveForms = drive.map(f => ({ ...f, added: existing.has(f.id) }))
  } catch (e) {
    console.error('Failed to list Drive forms:', e)
    const m = e?.message || 'unknown error'
    if (isExpiredToken(e)) {
      clearToken()
      notify('Session expired. Please sign in with Google again.')
    } else if (/not been used in project|has not been used|is disabled/i.test(m)) {
      const pid = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project'
      notify('One-time setup: enable the Google Drive API at console.developers.google.com/apis/api/drive.googleapis.com/overview?project=' + pid)
    } else if (/insufficient authentication scopes|insufficientPermissions/i.test(m)) {
      notify('Please sign out and sign in with Google again to grant Drive access.')
    } else {
      notify('Could not read your Drive forms: ' + m)
    }
    state.pickerOpen = false
  } finally {
    state.loadingDrive = false
  }
}

export function closeAddForm() {
  state.pickerOpen = false
  state.driveForms = []
}

/** Reads a chosen Drive form and saves it (auto-creating the collection). */
export async function addForm(picked) {
  if (!state.user || !picked) return
  const token = getToken()
  if (!token) return
  try {
    const result = await addGoogleForm(state.user, token, picked)
    state.forms[result.form.id] = applyLocal({ [result.form.id]: result.form })[result.form.id]
    const item = state.driveForms.find(f => f.id === picked.id)
    if (item) item.added = true
    notify(result.existed ? `“${result.form.name}” was already added` : `Added “${result.form.name}”`)
  } catch (e) {
    console.error('Failed to add form:', e)
    const m = e?.message || 'unknown error'
    if (isExpiredToken(e)) {
      clearToken()
      notify('Session expired. Please sign in with Google again.')
    } else if (/not been used in project|has not been used|is disabled/i.test(m)) {
      const pid = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project'
      notify('One-time setup: enable the Google Forms API at console.developers.google.com/apis/api/forms.googleapis.com/overview?project=' + pid)
    } else if (/insufficient authentication scopes|insufficientPermissions/i.test(m)) {
      notify('Please sign out and sign in with Google again to grant Forms access.')
    } else {
      notify('Could not add the form: ' + m)
    }
  }
}

/**
 * Adds or updates a response in the current form. Ids come from the caller or a
 * collision-safe generator (never `responses.length`), so removing a response
 * can't cause a later id to clash with an existing one.
 */
export function syncResponse(data = {}) {
  const f = form.value
  if (!f) return null
  const r = {
    id: data.id || newResponseId(),
    answers: data.answers || {},
    status: data.status || 'To review',
    notes: data.notes || '',
  }
  const idx = f.responses.findIndex(x => x.id === r.id)
  if (idx >= 0) f.responses.splice(idx, 1, { ...f.responses[idx], ...r })
  else f.responses.push(r)
  return r
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