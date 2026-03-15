import { useState } from 'react'
import type { ApprovalEntry } from '../../types'
import { RiskBadge } from '../RiskBadge/RiskBadge'
import { RevokeButton } from '../RevokeButton/RevokeButton'
import { formatAllowance, shortenAddress } from '../../utils/format'

interface ApprovalTableProps {
  approvals: ApprovalEntry[]
  explorerUrl: string
}

type SortKey = 'token' | 'spender' | 'allowance' | 'risk'
type SortDir = 'asc' | 'desc'

const riskOrder = { critical: 0, high: 1, normal: 2, revoked: 3 }

export function ApprovalTable({ approvals, explorerUrl }: ApprovalTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('risk')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [hideRevoked, setHideRevoked] = useState(false)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = hideRevoked
    ? approvals.filter((a) => a.riskLevel !== 'revoked')
    : approvals

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case 'token':
        cmp = a.token.symbol.localeCompare(b.token.symbol)
        break
      case 'spender':
        cmp = a.spender.localeCompare(b.spender)
        break
      case 'allowance':
        cmp = a.allowance < b.allowance ? -1 : a.allowance > b.allowance ? 1 : 0
        break
      case 'risk':
        cmp = riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
        break
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const SortHeader = ({ label, colKey }: { label: string; colKey: SortKey }) => (
    <th
      onClick={() => toggleSort(colKey)}
      className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400 transition-colors hover:text-white"
    >
      {label}
      {sortKey === colKey && (
        <span className="ml-1">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
      )}
    </th>
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {filtered.length} approval{filtered.length !== 1 ? 's' : ''}
        </p>
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            checked={hideRevoked}
            onChange={(e) => setHideRevoked(e.target.checked)}
            className="rounded border-gray-600"
          />
          Hide revoked
        </label>
      </div>
      <div className="overflow-x-auto rounded-lg border border-white/5">
        <table className="w-full">
          <thead className="bg-[#12121a]">
            <tr>
              <SortHeader label="Token" colKey="token" />
              <SortHeader label="Spender" colKey="spender" />
              <SortHeader label="Allowance" colKey="allowance" />
              <SortHeader label="Risk" colKey="risk" />
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((approval, i) => (
              <tr
                key={`${approval.token.address}-${approval.spender}-${i}`}
                className="transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{approval.token.symbol}</p>
                    <a
                      href={`${explorerUrl}/address/${approval.token.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 transition-colors hover:text-[#FF9000]"
                    >
                      {shortenAddress(approval.token.address)}
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`${explorerUrl}/address/${approval.spender}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-gray-300 transition-colors hover:text-[#FF9000]"
                  >
                    {shortenAddress(approval.spender)}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-gray-300">
                    {formatAllowance(approval.allowance, approval.token.decimals)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <RiskBadge level={approval.riskLevel} />
                </td>
                <td className="px-4 py-3">
                  {approval.riskLevel !== 'revoked' && (
                    <RevokeButton
                      tokenAddress={approval.token.address}
                      spender={approval.spender}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
