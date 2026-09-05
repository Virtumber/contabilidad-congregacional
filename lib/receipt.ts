export type ReceiptValues = {
  date: string
  worldwide: string
  congregation: string
}

export type ReceiptKey = keyof ReceiptValues

export const exampleValues: ReceiptValues = {
  date: '05/09/2026',
  worldwide: '15.000,00',
  congregation: '25.000,00',
}

export const receiptFields: { key: ReceiptKey; label: string; shortLabel: string }[] = [
  { key: 'date', label: 'Fecha de la transacción', shortLabel: 'la fecha' },
  { key: 'worldwide', label: 'Obra mundial', shortLabel: 'Obra mundial' },
  { key: 'congregation', label: 'Congregación', shortLabel: 'Congregación' },
]

export function parseAmount(value: string): number | null {
  const normalized = value.trim()
  if (!/^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/.test(normalized)) return null
  const [whole, decimals = ''] = normalized.replaceAll('.', '').split(',')
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, '0'))
  return Number.isSafeInteger(cents) && cents <= 999999999999 ? cents : null
}

export function formatAmount(cents: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function isValidDate(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return false
  const [, day, month, year] = match.map(Number)
  const date = new Date(year, month - 1, day)
  return year >= 2000 && year <= 2100 && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function getFieldError(key: ReceiptKey, value: string): string | null {
  if (!value.trim()) return 'Completá este dato.'
  if (key === 'date') return isValidDate(value) ? null : 'Usá una fecha válida: día/mes/año.'
  return parseAmount(value) === null ? 'Usá un importe como 15.000,00, sin el signo $.' : null
}

export function getCopyValue(key: ReceiptKey, value: string): string {
  if (key === 'date') return value.trim()
  const cents = parseAmount(value)
  return cents === null ? '' : (cents / 100).toFixed(2).replace('.', ',')
}

export async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    // Embedded previews may deny the Clipboard API while still allowing a user-initiated copy.
    const previousFocus = document.activeElement as HTMLElement | null
    const input = document.createElement('textarea')
    input.value = value
    input.setAttribute('aria-label', 'Dato para copiar')
    input.style.position = 'fixed'
    input.style.left = '-9999px'
    const container = document.querySelector('[data-slot="dialog-content"]') ?? document.body
    container.appendChild(input)
    try {
      input.select()
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      input.remove()
      previousFocus?.focus()
    }
  }
}
