import { doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { formLink } from './googleForms'

// Firestore has no "create collection" call. A collection appears the moment
// its first document is written, so every function below creates its
// collection automatically.

export const DEFAULT_STATUSES = ['To review', 'Graded', 'Needs follow-up']
export const DEFAULT_LAYOUT = { titleQuestionId: null, cardQuestionIds: [], groupBy: 'status', hiddenQuestionIds: [] }

/** users/{uid}: creates the `users` collection on first login. */
export async function ensureUser(user) {
  const ref = doc(db(), 'users', user.uid)
  const first = !(await getDoc(ref)).exists()
  await setDoc(ref, {
    displayName: user.displayName ?? '', email: user.email ?? '', photoURL: user.photoURL ?? '',
    lastLoginAt: serverTimestamp(), ...(first ? { createdAt: serverTimestamp() } : {}),
  }, { merge: true })
}

/** Public "fill in the form" link for a Google Form id. */
export { formLink }

/** forms/{googleFormId}: creates the `forms` collection. Never overwrites an existing form. */
export async function saveForm(user, picked, extra = {}) {
  const ref = doc(db(), 'forms', picked.id)
  let snap
  try { snap = await getDoc(ref) }
  catch { throw new Error('This form is already registered by another account.') }
  if (snap.exists()) return { id: ref.id, ...snap.data(), existed: true }
  const data = {
    ownerId: user.uid, title: picked.name, type: extra.type ?? 'other',
    link: extra.link ?? formLink(picked.id),
    statuses: DEFAULT_STATUSES, layout: extra.layout ?? DEFAULT_LAYOUT, reviewerIds: [],
    lastSyncedAt: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }
  await setDoc(ref, data)
  return { id: ref.id, ...data, existed: false }
}

/** All forms the signed-in teacher has added (powers the "My forms" screen). */
export async function listMyForms(uid) {
  const snap = await getDocs(query(collection(db(), 'forms'), where('ownerId', '==', uid)))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const saveLayout = (formId, layout) =>
  updateDoc(doc(db(), 'forms', formId), { layout, updatedAt: serverTimestamp() })

/** forms/{formId}/reviews/{responseId}: creates the `reviews` subcollection. */
export const saveReview = (formId, responseId, data) =>
  setDoc(doc(db(), 'forms', formId, 'reviews', responseId), { ...data, updatedAt: serverTimestamp() }, { merge: true })

/** One read for all reviews of a form, returned as { responseId: review }. */
export async function loadReviews(formId) {
  const snap = await getDocs(collection(db(), 'forms', formId, 'reviews'))
  return Object.fromEntries(snap.docs.map(d => [d.id, d.data()]))
}

/** Dev helper: writes one sample doc in each collection so all three show up in the console. */
export async function seedCollections(user) {
  await ensureUser(user)
  await saveForm(user, { id: 'sample-form', name: 'Sample form (delete me)' })
  await saveReview('sample-form', 'sample-response', {
    status: 'To review', score: null, maxScore: null, notes: '', assignedTo: null, reviewedAt: null,
  })
}
