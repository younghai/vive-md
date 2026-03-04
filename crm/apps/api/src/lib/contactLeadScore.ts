import { PrismaClient } from '@prisma/client'
import { calculateLeadScore, scoreToGrade } from './leadScore'

/** 연락처 리드 스코어 계산 및 저장 (DB 쿼리 포함) */
export async function recalcAndSaveLeadScore(prisma: PrismaClient, contactId: string, userId: string) {
  const [activityCount, wonDeals, openTasks, contact] = await Promise.all([
    prisma.activity.count({
      where: { contactId, deletedAt: null, ownerId: userId, type: 'CALL' },
    }),
    prisma.deal.count({
      where: { contactId, stage: 'WON', deletedAt: null, ownerId: userId },
    }),
    prisma.task.count({
      where: { contactId, deletedAt: null, ownerId: userId, completedAt: null },
    }),
    prisma.contact.findUnique({ where: { id: contactId } }),
  ])

  if (!contact || contact.deletedAt) return null

  const score = calculateLeadScore({
    activityCount,
    wonDealsCount: wonDeals,
    openTasksCount: openTasks,
    hasEmail: !!contact.email,
    hasPhone: !!contact.phone,
    hasCompany: !!contact.company,
    source: contact.source,
  })

  const grade = scoreToGrade(score)
  const summary = `call:${activityCount},won:${wonDeals},openTasks:${openTasks}`

  await prisma.leadScore.upsert({
    where: { contactId },
    create: {
      contactId,
      userId,
      score,
      grade,
      summary,
    },
    update: { score, grade, summary },
  })

  await prisma.leadScoreHistory.create({
    data: { contactId, userId, score, summary },
  })

  await prisma.contact.update({
    where: { id: contactId },
    data: { leadScore: score, leadGrade: grade },
  })

  return { score, grade }
}
