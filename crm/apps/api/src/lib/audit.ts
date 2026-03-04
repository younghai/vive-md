import { PrismaClient } from '@prisma/client'

export async function auditLog(
  prisma: PrismaClient,
  params: {
    userId?: string | null
    action: string
    resource: string
    resourceId?: string | null
    payload?: unknown
    ip?: string | null
    userAgent?: string | null
  },
) {
  try {
    const payload =
      params.payload != null
        ? (typeof params.payload === 'object' && !Array.isArray(params.payload)
            ? params.payload
            : { value: params.payload })
        : undefined

    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? undefined,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId ?? undefined,
        ...(payload && { payload }),
        ip: params.ip ?? undefined,
        userAgent: params.userAgent ?? undefined,
      },
    })
  } catch (e) {
    console.error('[Audit] Failed to write audit log:', e)
  }
}
