import { useState, useCallback } from 'react'
import type { Address } from 'viem'
import { validateAddress } from '../../utils/address'

interface AddressInputProps {
  onSubmit: (address: Address) => void
  isLoading: boolean
}

export function AddressInput({ onSubmit, isLoading }: AddressInputProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed) {
        setError('Please enter an address')
        return
      }
      const address = validateAddress(trimmed)
      if (!address) {
        setError('Invalid address')
        return
      }
      setError('')
      onSubmit(address)
    },
    [input, onSubmit],
  )

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col gap-2">
        <label htmlFor="address-input" className="sr-only">
          Rootstock wallet address
        </label>
        <div className="flex gap-3">
          <input
            id="address-input"
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (error) setError('')
            }}
            placeholder="Enter wallet address (0x...)"
            disabled={isLoading}
            maxLength={42}
            autoComplete="off"
            spellCheck="false"
            aria-describedby={error ? 'address-error' : undefined}
            aria-invalid={error ? 'true' : undefined}
            className="flex-1 rounded-lg border border-white/10 bg-[#1a1a2e] px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-[#FF9000]/50 focus:ring-1 focus:ring-[#FF9000]/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-[#FF9000] px-6 py-3 font-medium text-white transition-colors hover:bg-[#FFa333] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Scanning...' : 'Inspect'}
          </button>
        </div>
        {error && (
          <p id="address-error" className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  )
}
