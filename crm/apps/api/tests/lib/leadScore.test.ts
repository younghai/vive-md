import { describe, it, expect } from 'vitest'
import { scoreToGrade, calculateLeadScore } from '../../src/lib/leadScore'

describe('scoreToGrade', () => {
  it('A grade: score >= 80', () => {
    expect(scoreToGrade(80)).toBe('A')
    expect(scoreToGrade(100)).toBe('A')
    expect(scoreToGrade(95)).toBe('A')
  })

  it('B grade: score 60-79', () => {
    expect(scoreToGrade(60)).toBe('B')
    expect(scoreToGrade(79)).toBe('B')
    expect(scoreToGrade(70)).toBe('B')
  })

  it('C grade: score 40-59', () => {
    expect(scoreToGrade(40)).toBe('C')
    expect(scoreToGrade(59)).toBe('C')
    expect(scoreToGrade(50)).toBe('C')
  })

  it('D grade: score < 40', () => {
    expect(scoreToGrade(0)).toBe('D')
    expect(scoreToGrade(39)).toBe('D')
    expect(scoreToGrade(20)).toBe('D')
  })

  it('경계값 - 음수/초과는 클램핑 후 등급 반환', () => {
    expect(scoreToGrade(-10)).toBe('D')
    expect(scoreToGrade(110)).toBe('A')
  })
})

describe('calculateLeadScore', () => {
  const base = {
    activityCount: 0,
    wonDealsCount: 0,
    openTasksCount: 0,
    hasEmail: false,
    hasPhone: false,
    hasCompany: false,
  }

  it('기본 베이스 점수는 20', () => {
    expect(calculateLeadScore(base)).toBe(20)
  })

  it('활동(CALL) 1건마다 +7', () => {
    expect(calculateLeadScore({ ...base, activityCount: 1 })).toBe(27)
    expect(calculateLeadScore({ ...base, activityCount: 3 })).toBe(41)
  })

  it('성사된 딜 1건마다 +25', () => {
    expect(calculateLeadScore({ ...base, wonDealsCount: 1 })).toBe(45)
    expect(calculateLeadScore({ ...base, wonDealsCount: 2 })).toBe(70)
  })

  it('미완료 태스크 1건마다 -5', () => {
    expect(calculateLeadScore({ ...base, openTasksCount: 2 })).toBe(10)
    expect(calculateLeadScore({ ...base, openTasksCount: 4 })).toBe(0)
  })

  it('이메일 있으면 +5', () => {
    expect(calculateLeadScore({ ...base, hasEmail: true })).toBe(25)
  })

  it('전화번호 있으면 +5', () => {
    expect(calculateLeadScore({ ...base, hasPhone: true })).toBe(25)
  })

  it('회사 있으면 +5', () => {
    expect(calculateLeadScore({ ...base, hasCompany: true })).toBe(25)
  })

  it('website/referral 소스이면 +5', () => {
    expect(calculateLeadScore({ ...base, source: 'website' })).toBe(25)
    expect(calculateLeadScore({ ...base, source: 'referral' })).toBe(25)
  })

  it('기타 소스는 보너스 없음', () => {
    expect(calculateLeadScore({ ...base, source: 'ad' })).toBe(20)
    expect(calculateLeadScore({ ...base, source: 'manual' })).toBe(20)
    expect(calculateLeadScore({ ...base, source: null })).toBe(20)
  })

  it('최고 점수는 100으로 클램핑', () => {
    expect(
      calculateLeadScore({
        activityCount: 20,
        wonDealsCount: 5,
        openTasksCount: 0,
        hasEmail: true,
        hasPhone: true,
        hasCompany: true,
        source: 'website',
      }),
    ).toBe(100)
  })

  it('최저 점수는 0으로 클램핑', () => {
    expect(calculateLeadScore({ ...base, openTasksCount: 10 })).toBe(0)
  })

  it('복합 계산 - 여러 요인 동시 적용', () => {
    const score = calculateLeadScore({
      activityCount: 2,
      wonDealsCount: 1,
      openTasksCount: 1,
      hasEmail: true,
      hasPhone: false,
      hasCompany: true,
      source: 'referral',
    })
    // 20 + 14 + 25 - 5 + 5 + 5 + 5 = 69
    expect(score).toBe(69)
  })
})
