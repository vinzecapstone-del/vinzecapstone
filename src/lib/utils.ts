import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTrackingNumber(): string {
  const prefix = 'BRY'
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${year}-${random}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-orange-100 text-orange-800',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-800'
}

export function stripLogoSeal(html: string): string {
  if (!html) return html
  // Remove <img> tags whose src or alt contains 'logo' or 'seal' (case-insensitive)
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc\s*=\s*['\"]?([^'\">\s]+)['\"]?/i)
    const altMatch = tag.match(/\balt\s*=\s*['\"]([^'\"]*)['\"]/i)
    const src = srcMatch ? srcMatch[1] : ''
    const alt = altMatch ? altMatch[1] : ''
    if (/logo|seal/i.test(src) || /logo|seal/i.test(alt)) return ''
    return tag
  })
}