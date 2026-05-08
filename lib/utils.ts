import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DayType } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const DAY_TYPES: Record<DayType, { label: string; color: string; icon: string }> = {
  str: { label: 'Strength',    color: 'bg-teal-50 text-teal-800 border-teal-100',     icon: 'Dumbbell' },
  hyp: { label: 'Hypertrophy', color: 'bg-purple-50 text-purple-900 border-purple-100', icon: 'TrendingUp' },
  cor: { label: 'Core',        color: 'bg-pink-50 text-pink-800 border-pink-100',      icon: 'RotateCcw' },
  aer: { label: 'Aerobics',    color: 'bg-blue-50 text-blue-800 border-blue-100',      icon: 'Wind' },
  mob: { label: 'Mobility',    color: 'bg-amber-50 text-amber-900 border-amber-100',   icon: 'Expand' },
  rec: { label: 'Recovery',    color: 'bg-gray-50 text-gray-600 border-gray-200',      icon: 'Heart' },
  rst: { label: 'Rest day',    color: 'bg-gray-50 text-gray-400 border-gray-100',      icon: 'Moon' },
}

export function intensityColor(pct: number) {
  if (pct >= 80) return 'bg-red-50 text-red-700 border-red-200'
  if (pct >= 55) return 'bg-amber-50 text-amber-900 border-amber-100'
  return 'bg-teal-50 text-teal-800 border-teal-100'
}

export function intensityBarColor(pct: number) {
  if (pct >= 80) return 'bg-red-400'
  if (pct >= 55) return 'bg-amber-400'
  return 'bg-teal-400'
}

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}
