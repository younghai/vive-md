import type { Context } from 'hono'
import { AppError, errCode } from '../errors'
import { errorResponse } from '../response'

export const jsonErrorHandler = async (err: Error, c: Context) => {
  const requestId = c.get('requestId') || 'unknown'
  const path = c.req.path

  if (err instanceof AppError) {
    c.status(err.status as 400 | 401 | 403 | 404 | 409 | 422 | 500)
    return c.json(errorResponse(err.code, err.message, path, requestId, err.details))
  }

  if ((err as { status?: number }).status === 400) {
    c.status(400)
    return c.json(errorResponse(errCode.validation, err.message, path, requestId))
  }

  c.status(500)
  return c.json(errorResponse(errCode.internal, err.message || '서버 오류가 발생했습니다.', path, requestId))
}
