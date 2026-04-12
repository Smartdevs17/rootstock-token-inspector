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
    { label: 'Total Approvals', value: total, color: 'text-white', id: 'stat-total' },
    { label: 'Unlimited', value: critical, color: 'text-red-400', id: 'stat-unlimited' },
    { label: 'High Risk', value: high, color: 'text-amber-400', id: 'stat-high-risk' },
    { label: 'Tokens Exposed', value: uniqueTokens, color: 'text-[#FF9000]', id: 'stat-tokens' },
  ]

  return (
    <section aria-label="Approval summary statistics" className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          id={stat.id}
          className="rounded-lg border border-white/5 bg-[#1a1a2e] p-4"
          role="group"
          aria-labelledby={`${stat.id}-label`}
        >
          <p id={`${stat.id}-label`} className="text-sm text-gray-400">{stat.label}</p>
          <p className={`mt-1 text-2xl font-bold ${stat.color}`} aria-label={`${stat.value} ${stat.label.toLowerCase()}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </section>
  )
}
