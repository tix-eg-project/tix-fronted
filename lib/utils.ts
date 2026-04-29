import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return price.toLocaleString('ar-EG')
}

export function formatCurrency(price: number): string {
  return `${formatPrice(price)} ج.م`
}

export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  if (!originalPrice || originalPrice <= currentPrice) return 0
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

/**
 * Extract text from a localized API field.
 * The API may return either a plain string or an object like {ar: "...", en: "..."}.
 */
export function t(value: any): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return value.ar || value.en || Object.values(value).find(v => typeof v === 'string') || ''
  }
  return String(value)
}
