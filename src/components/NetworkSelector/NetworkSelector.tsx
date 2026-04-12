import type { NetworkId } from '../../types'

interface NetworkSelectorProps {
  value: NetworkId
  onChange: (id: NetworkId) => void
}

export function NetworkSelector({ value, onChange }: NetworkSelectorProps) {
  const options: Array<{ id: NetworkId; label: string }> = [
    { id: 30, label: 'Mainnet' },
    { id: 31, label: 'Testnet' },
  ]

  return (
    <div className="flex rounded-lg bg-[#1a1a2e] p-1" role="radiogroup" aria-label="Network selection">
      {options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          tabIndex={value === option.id ? 0 : -1}
          onClick={() => onChange(option.id)}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return

            event.preventDefault()
            const nextIndex = event.key === 'ArrowRight'
              ? (index + 1) % options.length
              : (index - 1 + options.length) % options.length
            onChange(options[nextIndex].id)
          }}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            value === option.id
              ? 'bg-[#FF9000]/20 text-[#FF9000] ring-1 ring-[#FF9000]/50'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {value === option.id && (
            <svg className="h-2 w-2" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
              <circle cx="4" cy="4" r="4" />
            </svg>
          )}
          {option.label}
        </button>
      ))}
    </div>
  )
}
