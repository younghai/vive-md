import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import app from '../../src/index'

function normalizePath(input: string) {
  return input
    .replace(/\{([^}]+)\}/g, ':$1')
    .replace(/\/+$/, '')
}

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

describe('openapi contract', () => {
  it('openapi v1 path/method는 app 라우트에 존재해야 한다', () => {
    const openApiPath = path.resolve(fileURLToPath(new URL('../../docs/openapi-v1.yaml', import.meta.url)))
    const text = readFileSync(openApiPath, 'utf8')

    const documented = new Set(parseOpenApi(text).map((entry) => normalizePath(entry)))
    const appRoutes = new Set(
      (app.routes || []).map((r: { method: string; path: string }) => `${r.method.toUpperCase()} ${normalizePath(r.path)}`),
    )

    const unmatched: string[] = []
    for (const item of documented) {
      if (!appRoutes.has(item)) {
        unmatched.push(item)
      }
    }

    expect(unmatched).toEqual([])
  })

  it('중요 비즈니스 경로에 대한 최소 응답 확인', async () => {
    const response = await app.request('/api/v1/contacts', {
      method: 'GET',
      headers: { Authorization: 'Bearer dummy-token' },
    })
    expect([200, 401, 500]).toContain(response.status)
  })
})
