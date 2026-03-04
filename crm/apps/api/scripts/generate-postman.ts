import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

type Endpoint = {
  method: string
  path: string
}

function parseOpenApiPaths(content: string): Endpoint[] {
  const lines = content.split('\n')
  const endpoints: Endpoint[] = []
  let currentPath = ''

  for (const line of lines) {
    const pathMatch = line.match(/^  (\/[^:]+):$/)
    if (pathMatch) {
      currentPath = pathMatch[1]
      continue
    }

    const methodMatch = line.match(/^    (get|post|patch|delete|put):$/)
    if (currentPath && methodMatch) {
      endpoints.push({
        method: methodMatch[1].toUpperCase(),
        path: currentPath,
      })
    }
  }

  return endpoints
}

function toPostmanPath(p: string) {
  return p.replace(/\{([^}]+)\}/g, '{{$1}}')
}

function isProtected(p: string) {
  if (!p.startsWith('/api/v1')) return false
  if (p === '/api/v1/health') return false
  if (p === '/api/v1/auth/register') return false
  if (p === '/api/v1/auth/login') return false
  if (p === '/api/v1/auth/refresh') return false
  return true
}

function folderName(p: string) {
  if (p === '/healthz') return 'system'
  const parts = p.split('/').filter(Boolean)
  if (parts.length < 3) return 'misc'
  return parts[2]
}

function toItem(endpoint: Endpoint) {
  const rawPath = toPostmanPath(endpoint.path)
  const headers: Array<{ key: string; value: string }> = []

  if (isProtected(endpoint.path)) {
    headers.push({ key: 'Authorization', value: 'Bearer {{bearerToken}}' })
  }

  if (endpoint.method === 'POST' || endpoint.method === 'PATCH' || endpoint.method === 'PUT') {
    headers.push({ key: 'Content-Type', value: 'application/json' })
  }

  const request: Record<string, unknown> = {
    method: endpoint.method,
    header: headers,
    url: `{{baseUrl}}${rawPath}`,
  }

  if (endpoint.method === 'POST' || endpoint.method === 'PATCH' || endpoint.method === 'PUT') {
    request.body = {
      mode: 'raw',
      raw: '{}',
      options: {
        raw: {
          language: 'json',
        },
      },
    }
  }

  return {
    name: `${endpoint.method} ${endpoint.path}`,
    request,
  }
}

const cwd = process.cwd()
const openApiPath = path.resolve(cwd, 'docs/openapi-v1.yaml')
const outputDir = path.resolve(cwd, 'docs/postman')
const outputPath = path.resolve(outputDir, 'crm-v1.postman_collection.json')

const openApiText = readFileSync(openApiPath, 'utf8')
const endpoints = parseOpenApiPaths(openApiText).sort((a, b) => {
  if (a.path === b.path) return a.method.localeCompare(b.method)
  return a.path.localeCompare(b.path)
})

const grouped = new Map<string, Endpoint[]>()
for (const endpoint of endpoints) {
  const name = folderName(endpoint.path)
  const list = grouped.get(name) ?? []
  list.push(endpoint)
  grouped.set(name, list)
}

const items = Array.from(grouped.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([name, list]) => ({
    name,
    item: list.map((e) => toItem(e)),
  }))

const collection = {
  info: {
    _postman_id: randomUUID(),
    name: 'CRM Service API v1',
    description: 'Generated from docs/openapi-v1.yaml',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:3001' },
    { key: 'bearerToken', value: '' },
    { key: 'id', value: 'replace-me' },
    { key: 'contactId', value: 'replace-me' },
    { key: 'dealId', value: 'replace-me' },
    { key: 'taskId', value: 'replace-me' },
  ],
  item: items,
}

mkdirSync(outputDir, { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(collection, null, 2)}\n`, 'utf8')
console.log(`Generated ${endpoints.length} requests: ${outputPath}`)
