import { useState } from 'react'
import type { ApprovalEntry } from '../../types'
import { RiskBadge } from '../RiskBadge/RiskBadge'
import { RevokeButton } from '../RevokeButton/RevokeButton'
import { formatAllowance, shortenAddress } from '../../utils/format'
import { RISK_ORDER } from '../../constants/risk'
import { SortHeader } from './SortHeader'
import type { SortKey, SortDir } from './types'

export type { SortKey, SortDir }

interface ApprovalTableProps {
  approvals: ApprovalEntry[]
  explorerUrl: string
}

const ITEMS_PER_PAGE = 20

export function ApprovalTable({ approvals, explorerUrl }: ApprovalTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('risk')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [hideRevoked, setHideRevoked] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const toggleSort = (key: SortKey) => {
    setCurrentPage(1)
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
        cmp = RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel]
        break
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paginated = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400" aria-live="polite">
          {filtered.length} approval{filtered.length !== 1 ? 's' : ''}
          {totalPages > 1 && ` (showing ${paginated.length})`}
        </p>
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            checked={hideRevoked}
            onChange={(e) => {
              setHideRevoked(e.target.checked)
              setCurrentPage(1)
            }}
            className="rounded border-gray-600"
          />
          Hide revoked
        </label>
      </div>
      <div className="overflow-x-auto rounded-lg border border-white/5">
        <table className="w-full" role="table" aria-label="Token approvals">
          <thead className="bg-[#12121a]">
            <tr>
              <SortHeader label="Token" colKey="token" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Spender" colKey="spender" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Allowance" colKey="allowance" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Risk" colKey="risk" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400" scope="col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5" role="rowgroup">
            {paginated.map((approval) => (
              <tr
                key={`${approval.token.address.toLowerCase()}-${approval.spender.toLowerCase()}`}
                className="transition-colors hover:bg-white/[0.02]"
                role="row"
              >
                <td className="px-4 py-3" role="cell">
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
                <td className="px-4 py-3" role="cell">
                  <a
                    href={`${explorerUrl}/address/${approval.spender}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-gray-300 transition-colors hover:text-[#FF9000]"
                  >
                    {shortenAddress(approval.spender)}
                  </a>
                </td>
                <td className="px-4 py-3" role="cell">
                  <span className="font-mono text-sm text-gray-300">
                    {formatAllowance(approval.allowance, approval.token.decimals, approval.token.decimalsUnknown)}
                  </span>
                </td>
                <td className="px-4 py-3" role="cell">
                  <RiskBadge level={approval.riskLevel} />
                </td>
                <td className="px-4 py-3" role="cell">
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

      {totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-between" aria-label="Pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
          >
            &larr; Previous
          </button>
          <p className="text-sm text-gray-400" aria-current="page">
            Page <span className="text-white font-medium">{currentPage}</span> of{' '}
            <span className="text-white font-medium">{totalPages}</span>
          </p>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
          >
            Next &rarr;
          </button>
        </nav>
      )}
    </div>
  )
}
