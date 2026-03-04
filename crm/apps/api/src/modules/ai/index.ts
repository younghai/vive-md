import { Hono } from 'hono'
import { AppError, errCode } from '../../lib/errors'
import { successResponse } from '../../lib/response'
import { prisma } from '../../lib/db'
import { recalcAndSaveLeadScore } from '../../lib/contactLeadScore'
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

  const result = await recalcAndSaveLeadScore(prisma, contactId, user.sub)
  const contactUpdated = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { leadScore: true, leadGrade: true },
  })

  return c.json(successResponse({
    contactId,
    score: contactUpdated?.leadScore ?? result?.score ?? 0,
    grade: contactUpdated?.leadGrade ?? result?.grade ?? 'D',
  }))
})

router.post('/rescore/:contactId', async (c) => {
  const user = c.get('user') as AuthUser
  const { contactId } = c.req.param()

  const contact = await prisma.contact.findUnique({ where: { id: contactId } })
  if (!contact || contact.deletedAt) {
    throw new AppError(404, errCode.notFound, '연락처를 찾을 수 없습니다.')
  }

  if (user.role !== 'ADMIN' && contact.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  const result = await recalcAndSaveLeadScore(prisma, contactId, user.sub)
  return c.json(successResponse({ contactId, score: result?.score ?? 0, grade: result?.grade ?? 'D' }))
})

router.get('/recommendations/today', async (c) => {
  const user = c.get('user') as AuthUser
  const where = {
    deletedAt: null,
    ownerId: user.role === 'ADMIN' ? undefined : user.sub,
  }

  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: [{ leadScore: 'desc' }, { lastContactAt: 'asc' }],
    take: 10,
    select: {
      id: true,
      name: true,
      company: true,
      leadScore: true,
      leadGrade: true,
      lastContactAt: true,
    },
  })

  const recommendations = contacts.map((contact, idx) => {
    const daysSinceContact = contact.lastContactAt
      ? Math.floor((Date.now() - contact.lastContactAt.getTime()) / 86400000)
      : 999
    const actionType = daysSinceContact >= 3 ? 'phone' : 'email'
    const actionLabel = daysSinceContact >= 3 ? '전화 연락' : '이메일 발송'
    const reason =
      daysSinceContact >= 3
        ? `${daysSinceContact}일 전 연락. ${contact.leadGrade ?? 'D'}등급 리드.`
        : `최근 연락함. ${contact.leadGrade ?? 'D'}등급 리드.`
    return {
      id: `rec-${contact.id}`,
      priority: idx + 1,
      actionType,
      actionLabel,
      contact: { id: contact.id, name: contact.name, company: contact.company },
      reason,
      suggestedTime: idx < 3 ? '오전 10시' : '오후 2시',
      leadScore: contact.leadScore ?? 0,
    }
  })

  return c.json(successResponse({ recommendations, totalCount: recommendations.length }))
})

router.get('/recommendations', async (c) => {
  const user = c.get('user') as AuthUser
  const limit = Math.min(Number(c.req.query('limit')) || 10, 20)
  const where = {
    deletedAt: null,
    ownerId: user.role === 'ADMIN' ? undefined : user.sub,
  }

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: [{ leadScore: 'desc' }, { lastContactAt: 'asc' }],
    take: limit,
    select: {
      id: true,
      name: true,
      company: true,
      leadScore: true,
      leadGrade: true,
      lastContactAt: true,
    },
  })

  const recommendations = contacts.map((contact, idx) => {
    const daysSinceContact = contact.lastContactAt
      ? Math.floor((Date.now() - contact.lastContactAt.getTime()) / 86400000)
      : 999
    const actionType = daysSinceContact >= 3 ? 'phone' : 'email'
    const actionLabel = daysSinceContact >= 3 ? '전화 연락' : '이메일 발송'
    return {
      id: `rec-${contact.id}`,
      priority: idx + 1,
      actionType,
      actionLabel,
      contact: { id: contact.id, name: contact.name, company: contact.company },
      leadScore: contact.leadScore ?? 0,
    }
  })

  return c.json(successResponse({ recommendations, totalCount: recommendations.length }))
})

router.get('/recommendations/:contactId', async (c) => {
  const user = c.get('user') as AuthUser
  const { contactId } = c.req.param()

  const contact = await prisma.contact.findUnique({ where: { id: contactId } })
  if (!contact || contact.deletedAt) {
    throw new AppError(404, errCode.notFound, '연락처를 찾을 수 없습니다.')
  }
  if (user.role !== 'ADMIN' && contact.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  const target = await prisma.leadScore.findUnique({ where: { contactId } })
  const score = target?.score ?? contact.leadScore ?? 0

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
