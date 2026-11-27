// Reads form structure and responses live from Google (nothing student-related is copied to Firestore).
const BASE = 'https://forms.googleapis.com/v1/forms'

/** Public "fill in the form" link for a Google Form id. */
export const formLink = id => `https://docs.google.com/forms/d/${id}/viewform`
/** Owner "edit the form" link. */
export const editLink = id => `https://docs.google.com/forms/d/${id}/edit`

async function call(url, token) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) {
    const reason = d?.error?.message || d?.error?.status || `HTTP ${r.status}`
    throw new Error(`Google API error ${r.status}: ${reason}`)
  }
  return d
}
export const fetchForm = (id, token) => call(`${BASE}/${id}`, token)

export async function fetchResponses(id, token) {
  const all = []; let page = ''
  do {
    const d = await call(`${BASE}/${id}/responses${page ? `?pageToken=${page}` : ''}`, token)
    all.push(...(d.responses ?? [])); page = d.nextPageToken
  } while (page)
  return all
}
export const isQuiz = form => Boolean(form?.settings?.quizSettings?.isQuiz)
export const questionsOf = form => (form?.items ?? [])
  .filter(i => i.questionItem).map(i => ({ id: i.questionItem.question.questionId, title: i.title }))

/** Sensible starting layout: first question is the card title, next three show on cards. */
export function defaultLayout(questions) {
  return {
    titleQuestionId: questions[0]?.id ?? null,
    cardQuestionIds: questions.slice(1, 4).map(q => q.id),
    groupBy: 'status', hiddenQuestionIds: [],
  }
}

/** Flattens one answer's text values into a display string. */
function answerValue(answer) {
  const parts = (answer?.textAnswers?.answers ?? []).map(a => a.value).filter(Boolean)
  return parts.join(', ')
}

/**
 * Converts a saved Firestore form doc + live Google form/responses into the
 * shape the Vue components expect:
 * { id, name, type, link, modified, fields:[[key,label]], layout:{title,group,show}, responses:[{id,answers,status,notes}] }
 */
export function toAppForm(saved = {}, form, responses = []) {
  const fields = questionsOf(form).map(q => [q.id, q.title])
  const qids = fields.map(f => f[0])
  const savedLayout = saved.layout ?? {}
  const hidden = savedLayout.hiddenQuestionIds ?? []

  const title = qids.includes(savedLayout.titleQuestionId) ? savedLayout.titleQuestionId : (qids[0] ?? null)
  const show = (savedLayout.cardQuestionIds?.length ? savedLayout.cardQuestionIds : qids.slice(1, 4))
    .filter(k => k !== title && !hidden.includes(k))
  const group = savedLayout.groupBy ?? 'status'

  const appResponses = responses.map(r => {
    const answers = {}
    for (const [qid, a] of Object.entries(r.answers ?? {})) answers[qid] = answerValue(a)
    return { id: r.responseId, answers, status: 'To review', notes: '' }
  })

  return {
    id: saved.id,
    name: saved.title ?? form?.info?.documentTitle ?? 'Untitled form',
    type: saved.type ?? (isQuiz(form) ? 'quiz' : 'other'),
    link: saved.link ?? (saved.id ? formLink(saved.id) : ''),
    modified: saved.lastSyncedAt?.toDate?.().toLocaleString?.() ?? '',
    modifiedAt: saved.lastSyncedAt?.toDate?.().getTime?.() ?? 0,
    fields,
    layout: { title, group, show },
    responses: appResponses,
  }
}