export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
  }
}

export const errCode = {
  unauthorized: 'UNAUTHORIZED',
  forbidden: 'FORBIDDEN',
  badRequest: 'BAD_REQUEST',
  conflict: 'CONFLICT',
  notFound: 'NOT_FOUND',
  validation: 'VALIDATION_ERROR',
  internal: 'INTERNAL_SERVER_ERROR',
} as const
