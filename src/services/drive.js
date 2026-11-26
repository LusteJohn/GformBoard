// Lists the signed-in user's Google Forms via the Drive API, using only the
// OAuth access token granted at sign-in. No API key / Picker required.
const BASE = 'https://www.googleapis.com/drive/v3'

/** Returns [{ id, name, modifiedTime }] for every form in the user's Drive. */
export async function listDriveForms(token) {
  const q = encodeURIComponent("mimeType='application/vnd.google-apps.form' and trashed=false")
  const url = `${BASE}/files?q=${q}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&pageSize=100`
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) {
    const reason = d?.error?.message || d?.error?.status || `HTTP ${r.status}`
    throw new Error(`Drive API error ${r.status}: ${reason}`)
  }
  return d.files ?? []
}