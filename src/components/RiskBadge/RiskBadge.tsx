import type { RiskLevel } from '../../types'

interface RiskBadgeProps {
  level: RiskLevel
}

const config: Record<RiskLevel, { label: string; className: string; icon: string }> = {
  critical: {
    label: 'Unlimited',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: '\u26A0',
  },
  high: {
    label: 'High',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: '\u26A0',
  },
  normal: {
    label: 'Normal',
    className: 'bg-green-500/15 text-green-400 border-green-500/30',
    icon: '\u2713',
  },
  revoked: {
    label: 'Revoked',
    className: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    icon: '\u2212',
  },
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const { label, className, icon } = config[level]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${className}`}
    >
      <span>{icon}</span>
      {label}
    </span>
  )
}
