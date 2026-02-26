declare module 'hono' {
  interface ContextVariableMap {
    user: {
      sub: string
      email: string
      role: 'USER' | 'ADMIN'
    }
    requestId: string
  }
}

export {}
