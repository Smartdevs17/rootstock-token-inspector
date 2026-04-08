import type { ReactNode } from 'react'
import type { RiskLevel } from '../../types'

interface RiskBadgeProps {
  level: RiskLevel
}

const config: Record<RiskLevel, { label: string; className: string; icon: ReactNode; description: string }> = {
  critical: {
    label: 'Unlimited',
    description: 'This approval has no spending limit. The spender can transfer all tokens.',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  high: {
    label: 'High',
    description: 'This approval has an unusually high spending limit.',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  normal: {
    label: 'Normal',
    description: 'This approval has a reasonable spending limit.',
    className: 'bg-green-500/15 text-green-400 border-green-500/30',
    icon: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  revoked: {
    label: 'Revoked',
    description: 'This approval has been revoked. The spender can no longer transfer tokens.',
    className: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    icon: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const { label, className, icon, description } = config[level]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${className}`}
      role="status"
      aria-label={`Risk level: ${label}. ${description}`}
      title={description}
    >
      {icon}
      {label}
    </span>
  )
}
