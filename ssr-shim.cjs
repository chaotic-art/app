// Shim localStorage for SSR — @vue/devtools-kit@7.7.7 accesses
// localStorage.getItem at module init time, crashing in Node.js.
if (typeof globalThis.localStorage === 'undefined' || typeof (globalThis.localStorage && globalThis.localStorage.getItem) !== 'function') {
  const storage = new Map()
  globalThis.localStorage = {
    getItem(key) { return storage.get(key) || null },
    setItem(key, value) { storage.set(key, String(value)) },
    removeItem(key) { storage.delete(key) },
    clear() { storage.clear() },
    get length() { return storage.size },
    key(index) { return Array.from(storage.keys())[index] || null },
  }
}
