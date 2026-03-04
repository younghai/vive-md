import { clamp } from './shared'

/** SRS: A>=80, B 60-79, C 40-59, D<40 */
export function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' {
  const s = clamp(score, 0, 100)
  if (s >= 80) return 'A'
  if (s >= 60) return 'B'
  if (s >= 40) return 'C'
  return 'D'
}

/** 리드 스코어 계산: 활동·딜·작업 기반 (간이 알고리즘) */
export function calculateLeadScore(params: {
  activityCount: number
  wonDealsCount: number
  openTasksCount: number
  hasEmail: boolean
  hasPhone: boolean
  hasCompany: boolean
  source?: string | null
}): number {
  const { activityCount, wonDealsCount, openTasksCount, hasEmail, hasPhone, hasCompany, source } = params
  let raw = 20
  raw += activityCount * 7
  raw += wonDealsCount * 25
  raw -= openTasksCount * 5
  if (hasEmail) raw += 5
  if (hasPhone) raw += 5
  if (hasCompany) raw += 5
  if (source && ['website', 'referral'].includes(source)) raw += 5
  return clamp(raw, 0, 100)
}
