import type { SortKey, SortDir } from './types'

interface SortHeaderProps {
  label: string
  colKey: SortKey
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
}

export function SortHeader({ label, colKey, sortKey, sortDir, onSort }: SortHeaderProps) {
  const isActive = sortKey === colKey
  const sortDirection: 'ascending' | 'descending' | 'none' = isActive
    ? sortDir === 'asc' ? 'ascending' : 'descending'
    : 'none'

  return (
    <th aria-sort={sortDirection} scope="col">
      <button
        type="button"
        onClick={() => onSort(colKey)}
        className="flex items-center gap-1 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400 transition-colors hover:text-white"
      >
        {label}
        {isActive && (
          <span className="text-[#FF9000]" aria-hidden="true">
            {sortDir === 'asc' ? '\u2191' : '\u2193'}
          </span>
        )}
        <span className="sr-only">
          {isActive ? (sortDir === 'asc' ? ', sorted ascending' : ', sorted descending') : ', not sorted'}
        </span>
      </button>
    </th>
  )
}
