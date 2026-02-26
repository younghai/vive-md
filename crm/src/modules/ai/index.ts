import { Hono } from 'hono'
import { AppError, errCode } from '../../lib/errors'
import { successResponse } from '../../lib/response'
import { clamp } from '../../lib/shared'
import { prisma } from '../../lib/db'
import type { AuthUser } from '../../lib/middleware/auth'

const router = new Hono()

router.get('/lead-score/:contactId', async (c) => {
  const user = c.get('user') as AuthUser
  const { contactId } = c.req.param()

  const contact = await prisma.contact.findUnique({ where: { id: contactId } })
  if (!contact || contact.deletedAt) {
    throw new AppError(404, errCode.notFound, '연락처를 찾을 수 없습니다.')
  }

  if (user.role !== 'ADMIN' && contact.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  const [activityCount, taskCount, wonDeals] = await Promise.all([
    prisma.activity.count({ where: { contactId, deletedAt: null, ownerId: user.sub, type: 'CALL' } }),
    prisma.task.count({ where: { contactId, deletedAt: null, ownerId: user.sub, completedAt: null } }),
    prisma.deal.count({ where: { contactId, stage: 'WON', deletedAt: null, ownerId: user.sub } }),
  ])

  const raw = 20 + activityCount * 7 + wonDeals * 25 - taskCount * 5
  const score = clamp(raw, 0, 100)

  await prisma.leadScore.upsert({
    where: { contactId },
    create: { contactId, userId: user.sub, score, summary: `call:${activityCount},won:${wonDeals},openTasks:${taskCount}` },
    update: { score, summary: `call:${activityCount},won:${wonDeals},openTasks:${taskCount}`, createdAt: new Date() },
  })

  await prisma.leadScoreHistory.create({
    data: {
      contactId,
      userId: user.sub,
      score,
      summary: `activity:${activityCount},tasks:${taskCount}`,
    },
  })

  return c.json(successResponse({ contactId, score }))
})

router.get('/recommendations/:contactId', async (c) => {
  const user = c.get('user') as AuthUser
  const { contactId } = c.req.param()

  const target = await prisma.leadScore.findUnique({ where: { contactId } })
  const score = target?.score ?? 0

  const items =
    score < 35
      ? [
          '첫 1:1 문의 전화를 1회 이상 수행',
          '담당자 메모를 2회 이상 기록',
        ]
      : score < 70
        ? ['고객사 니즈 확인 질문 3개 추가', '제안서 뼈대 템플릿 1개 공유']
        : ['타임라인 기반 제안서 리마인드', '구매 의사 결정자에게 데모 제안']

  return c.json(successResponse({ contactId, score, recommendations: items }))
})

export default router
