// Ties the Google flow together: list the user's Drive forms -> read one live
// -> save it (auto-creating the Firestore `forms` collection) -> shape it for the UI.
import { listDriveForms } from './drive'
import { fetchForm, fetchResponses, questionsOf, defaultLayout, isQuiz, toAppForm, formLink } from './googleForms'
import { saveForm, listMyForms, loadReviews } from './firestore'

/** All forms in the signed-in user's Drive, as [{ id, name, modifiedTime }]. */
export const getDriveForms = (token) => listDriveForms(token)

/**
 * Reads a chosen Drive form and persists it. `picked` is { id, name }.
 * Returns { existed, form } where `form` is in the app's UI shape.
 */
export async function addGoogleForm(user, token, picked) {
  const googleForm = await fetchForm(picked.id, token)
  const questions = questionsOf(googleForm)
  const layout = defaultLayout(questions)

  const saved = await saveForm(user, picked, {
    type: isQuiz(googleForm) ? 'quiz' : 'other',
    layout,
    link: formLink(picked.id),
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