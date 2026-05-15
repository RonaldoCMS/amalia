'use client'

import { UserRole } from '@amalia/shared'

const BADGE_CONFIG: Record<string, { emoji: string; label: string; className: string }> = {
  moderator: { emoji: '🛡️', label: 'Mod', className: 'bg-green-100 text-green-800 border-green-300' },
  admin: { emoji: '⚙️', label: 'Admin', className: 'bg-purple-100 text-purple-800 border-purple-300' },
  founder: { emoji: '👑', label: 'Founder', className: 'bg-amber-100 text-amber-800 border-amber-300' },
}

interface RoleBadgeProps {
  role: UserRole | string
  size?: 'sm' | 'md'
}

export function RoleBadge({ role, size = 'sm' }: RoleBadgeProps) {
  const config = BADGE_CONFIG[role]
  if (!config) return null // Don't show badge for regular users

  const sizeClasses = size === 'sm'
    ? 'text-xs px-1.5 py-0.5'
    : 'text-sm px-2 py-1'

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full border font-medium ${config.className} ${sizeClasses}`}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  )
}
