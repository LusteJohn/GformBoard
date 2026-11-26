// Ties the Google flow together: pick a Drive form -> read it live -> save the
// form (auto-creating the Firestore `forms` collection) -> shape it for the UI.
import { pickForm } from './picker'
import { fetchForm, fetchResponses, questionsOf, defaultLayout, isQuiz, toAppForm } from './googleForms'
import { saveForm, listMyForms, loadReviews } from './firestore'

/**
 * Picker -> read -> persist. Returns { existed, form } or null if cancelled.
 * `form` is already in the app's UI shape.
 */
export async function addGoogleForm(user, token) {
  const picked = await pickForm(token)
  if (!picked) return null

  const googleForm = await fetchForm(picked.id, token)
  const questions = questionsOf(googleForm)
  const layout = defaultLayout(questions)

  const saved = await saveForm(user, picked, {
    type: isQuiz(googleForm) ? 'quiz' : 'other',
    layout,
    link: `https://docs.google.com/forms/d/${picked.id}/viewform`,
  })

  const responses = saved.existed ? await fetchResponses(picked.id, token) : []
  return { existed: saved.existed, form: toAppForm(saved, googleForm, responses) }
}

/**
 * Loads every form the signed-in teacher saved, reading each live from Google
 * and merging any saved reviews. Returns a { [formId]: appForm } map.
 */
export async function loadMyForms(user, token) {
  const savedForms = await listMyForms(user.uid)
  const out = {}
  for (const saved of savedForms) {
    let googleForm = null
    let responses = []
    try {
      googleForm = await fetchForm(saved.id, token)
      responses = await fetchResponses(saved.id, token)
    } catch (e) {
      console.error(`Could not read form ${saved.id}:`, e)
    }
    const appForm = toAppForm(saved, googleForm, responses)

    // Merge saved review status/notes/score so the board survives a reload.
    try {
      const reviews = await loadReviews(saved.id)
      appForm.responses.forEach((r) => {
        const rev = reviews[r.id]
        if (!rev) return
        if (rev.status) r.status = rev.status
        if (rev.notes != null) r.notes = rev.notes
        if (rev.score != null) r.answers.score = rev.score
      })
    } catch (e) {
      console.error(`Could not load reviews for ${saved.id}:`, e)
    }

    out[saved.id] = appForm
  }
  return out
}