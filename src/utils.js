// Collision-safe id generator. Uses crypto.randomUUID when available and falls
// back to a timestamp+random string. Never derive ids from array length, since
// removing an item can make a later "length-based" id collide with an existing one.
export function newResponseId() {
  const c = globalThis.crypto
  if (c?.randomUUID) return 'r_' + c.randomUUID()
  if (c?.getRandomValues) {
    const a = new Uint32Array(2)
    c.getRandomValues(a)
    return 'r_' + a[0].toString(36) + a[1].toString(36)
  }
  return 'r_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}