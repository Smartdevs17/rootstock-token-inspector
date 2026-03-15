import type { ApprovalEntry } from '../../types'

interface SummaryStatsProps {
  approvals: ApprovalEntry[]
}

export function SummaryStats({ approvals }: SummaryStatsProps) {
  const total = approvals.length
  const critical = approvals.filter((a) => a.riskLevel === 'critical').length
  const high = approvals.filter((a) => a.riskLevel === 'high').length
  const uniqueTokens = new Set(approvals.map((a) => a.token.address.toLowerCase())).size

  const stats = [
    { label: 'Total Approvals', value: total, color: 'text-white' },
    { label: 'Unlimited', value: critical, color: 'text-red-400' },
    { label: 'High Risk', value: high, color: 'text-amber-400' },
    { label: 'Tokens Exposed', value: uniqueTokens, color: 'text-[#FF9000]' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-white/5 bg-[#1a1a2e] p-4"
        >
          <p className="text-sm text-gray-400">{stat.label}</p>
          <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
