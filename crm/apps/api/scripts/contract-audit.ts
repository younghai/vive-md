import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

process.env.NODE_ENV = 'test'

const openApiPath = path.resolve(fileURLToPath(new URL('../docs/openapi-v1.yaml', import.meta.url)))
const text = fs.readFileSync(openApiPath, 'utf8')

function parseOpenApi(pathText: string) {
  const lines = pathText.split('\n')
  const out: string[] = []
  let currentPath = ''

  for (const line of lines) {
    const pathMatch = line.match(/^  (\/[^:]+):$/)
    if (pathMatch) {
      currentPath = pathMatch[1]
      continue
    }

    const methodMatch = line.match(/^    (get|post|patch|delete|put):$/)
    if (currentPath && methodMatch) {
      out.push(`${methodMatch[1].toUpperCase()} ${currentPath}`)
    }
  }

  return out
}

function normalize(pathWithPlaceholders: string) {
  return pathWithPlaceholders
    .replace(/\{([^}]+)\}/g, ':$1')
    .replace(/\/+$/, '')
}

const docs = new Set(parseOpenApi(text).map((item) => normalize(item)))

const { default: app } = await import('../src/index.ts')
const appRoutes = new Set((app.routes || []).map((r: { method: string; path: string }) => `${r.method.toUpperCase()} ${r.path}`))

const normalizedAppRoutes = new Set(Array.from(appRoutes).map((item) => normalize(item)))

const documented = Array.from(docs).sort()
const implemented = Array.from(normalizedAppRoutes).filter((entry) => !entry.startsWith('ALL ')).sort()

const missing = documented.filter((entry) => !implemented.includes(entry))
const extra = implemented.filter((entry) => !docs.has(entry))

console.log(`Documented routes: ${documented.length}`)
console.log(`Implemented routes: ${implemented.length}`)

if (missing.length > 0) {
  console.log('Missing route contracts:')
  for (const row of missing) {
    console.log(` - ${row}`)
  }
}

if (extra.length > 0) {
  console.log('Extra routes (code-only):')
  for (const row of extra) {
    console.log(` - ${row}`)
  }
}

if (missing.length > 0) {
  process.exit(1)
}

console.log('OpenAPI contract check passed.')
