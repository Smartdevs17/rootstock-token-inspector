import type { NetworkId } from '../../types'

interface NetworkSelectorProps {
  value: NetworkId
  onChange: (id: NetworkId) => void
}

export function NetworkSelector({ value, onChange }: NetworkSelectorProps) {
  return (
    <div className="flex rounded-lg bg-[#1a1a2e] p-1">
      <button
        onClick={() => onChange(30)}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          value === 30
            ? 'bg-[#FF9000]/20 text-[#FF9000]'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Mainnet
      </button>
      <button
        onClick={() => onChange(31)}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          value === 31
            ? 'bg-[#FF9000]/20 text-[#FF9000]'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Testnet
      </button>
    </div>
  )
}
