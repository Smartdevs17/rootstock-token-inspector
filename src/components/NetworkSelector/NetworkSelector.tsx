import type { NetworkId } from '../../types'

interface NetworkSelectorProps {
  value: NetworkId
  onChange: (id: NetworkId) => void
}

export function NetworkSelector({ value, onChange }: NetworkSelectorProps) {
  return (
    <div className="flex rounded-lg bg-[#1a1a2e] p-1" role="tablist" aria-label="Network selection">
      <button
        role="tab"
        aria-selected={value === 30}
        onClick={() => onChange(30)}
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          value === 30
            ? 'bg-[#FF9000]/20 text-[#FF9000] ring-1 ring-[#FF9000]/50'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        {value === 30 && (
          <svg className="h-2 w-2" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
            <circle cx="4" cy="4" r="4" />
          </svg>
        )}
        Mainnet
      </button>
      <button
        role="tab"
        aria-selected={value === 31}
        onClick={() => onChange(31)}
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          value === 31
            ? 'bg-[#FF9000]/20 text-[#FF9000] ring-1 ring-[#FF9000]/50'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        {value === 31 && (
          <svg className="h-2 w-2" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
            <circle cx="4" cy="4" r="4" />
          </svg>
        )}
        Testnet
      </button>
    </div>
  )
}
