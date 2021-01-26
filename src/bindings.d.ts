export {}

interface StaticBase {
  'index.html': string
}

declare global {
  const KV: KVNamespace
  const STATIC: StaticBase
}
