// Google Picker: lets the teacher choose a form from Drive (drive.file scope).
let loading
const loadPicker = () => (loading ??= new Promise((resolve, reject) => {
  const s = document.createElement('script')
  s.src = 'https://apis.google.com/js/api.js'
  s.onload = () => window.gapi.load('picker', resolve)
  s.onerror = reject
  document.head.appendChild(s)
}))

/** Resolves { id, name } for the chosen form, or null if cancelled. */
export async function pickForm(accessToken) {
  await loadPicker()
  const g = window.google.picker
  return new Promise(resolve => {
    new g.PickerBuilder()
      .addView(new g.DocsView(g.ViewId.FORMS))
      .setOAuthToken(accessToken)
      .setDeveloperKey(import.meta.env.VITE_GOOGLE_API_KEY)
      .setAppId(import.meta.env.VITE_GOOGLE_PROJECT_NUMBER)
      .setCallback(d => {
        if (d.action === g.Action.PICKED) resolve({ id: d.docs[0].id, name: d.docs[0].name })
        else if (d.action === g.Action.CANCEL) resolve(null)
      })
      .build().setVisible(true)
  })
}
