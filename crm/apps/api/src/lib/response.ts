export function successResponse<T>(data: T, pagination?: Record<string, unknown>) {
  if (pagination) {
    return {
      data,
      pagination,
    }
  }

  return { data }
}

export function errorResponse(
  code: string,
  message: string,
  requestPath: string,
  requestId: string,
  details?: unknown,
) {
  return {
    error: {
      code,
      message,
      details: details ?? null,
      timestamp: new Date().toISOString(),
      path: requestPath,
      requestId,
    },
  }
}
