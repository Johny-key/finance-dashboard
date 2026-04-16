/** Returns '2026-04-01' — first day of a given month */
export function firstDayOfMonth(year: number, month: number): string {
  return new Date(year, month, 1).toISOString().slice(0, 10)
}

/** Returns '2026-04-30' — last day of a given month */
export function lastDayOfMonth(year: number, month: number): string {
  return new Date(year, month + 1, 0).toISOString().slice(0, 10)
}

/** Current month as first-day date: '2026-04-01' */
export function currentMonthStart(): string {
  const now = new Date()
  return firstDayOfMonth(now.getFullYear(), now.getMonth())
}

/** Current month end: '2026-04-30' */
export function currentMonthEnd(): string {
  const now = new Date()
  return lastDayOfMonth(now.getFullYear(), now.getMonth())
}

/** 6 months ago first day */
export function sixMonthsAgoStart(): string {
  const now = new Date()
  return firstDayOfMonth(now.getFullYear(), now.getMonth() - 5)
}

/** Format date for display: '14 апр.' */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

/** '2026-04-01' → 'Апрель 2026' */
export function formatMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })
}

/** Current month label: 'Апрель 2026' */
export function currentMonthLabel(): string {
  return formatMonth(currentMonthStart())
}
