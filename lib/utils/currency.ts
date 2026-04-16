export function formatRub(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

/** Returns true only if the string contains an emoji character.
 *  Filters out old Lucide icon name strings like "Car", "Home", "Briefcase". */
export function isEmoji(str: string | null | undefined): boolean {
  if (!str) return false
  return /\p{Extended_Pictographic}/u.test(str)
}
