export function toNumber(v: unknown, fallback: number) {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v
  }

  if (typeof v === 'string') {
    const parsed = Number(v)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
