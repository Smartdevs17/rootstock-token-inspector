import { useState } from 'react'
import type { Address } from 'viem'
import { buildRevokeTransaction } from '../../lib/revoke'

interface RevokeButtonProps {
  tokenAddress: Address
  spender: Address
  disabled?: boolean
}

export function RevokeButton({ tokenAddress, spender, disabled }: RevokeButtonProps) {
  const [showCalldata, setShowCalldata] = useState(false)

  const tx = buildRevokeTransaction(tokenAddress, spender)

  return (
    <div className="relative">
      <button
        onClick={() => setShowCalldata(!showCalldata)}
        disabled={disabled}
        className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Revoke
      </button>
      {showCalldata && (
        <div className="absolute right-0 top-full z-10 mt-2 w-80 rounded-lg border border-white/10 bg-[#12121a] p-4 shadow-xl">
          <p className="mb-2 text-xs font-medium text-gray-400">
            Revoke Transaction Calldata
          </p>
          <div className="mb-3 space-y-2">
            <div>
              <span className="text-xs text-gray-500">To:</span>
              <p className="break-all font-mono text-xs text-white">{tx.to}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Data:</span>
              <p className="break-all font-mono text-xs text-white">{tx.data}</p>
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify({
                to: tx.to,
                data: tx.data,
                value: '0',
              }, null, 2))
            }}
            className="w-full rounded-md bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-white/10"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  )
}
