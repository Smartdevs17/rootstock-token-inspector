import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import type { Address } from 'viem'
import { buildRevokeTransaction } from '../../lib/revoke'

interface RevokeButtonProps {
  tokenAddress: Address
  spender: Address
  disabled?: boolean
}

export function RevokeButton({ tokenAddress, spender, disabled }: RevokeButtonProps) {
  const [showCalldata, setShowCalldata] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const tx = useMemo(() => buildRevokeTransaction(tokenAddress, spender), [tokenAddress, spender])

  const closePopover = useCallback(() => {
    setShowCalldata(false)
  }, [])

  useEffect(() => {
    if (!showCalldata) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closePopover()
        buttonRef.current?.focus()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        closePopover()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalldata, closePopover])

  const handleCopyToClipboard = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify({
        to: tx.to,
        data: tx.data,
        value: '0',
      }, null, 2))
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = JSON.stringify({
        to: tx.to,
        data: tx.data,
        value: '0',
      }, null, 2)
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    closePopover()
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        ref={buttonRef}
        onClick={() => setShowCalldata(!showCalldata)}
        disabled={disabled}
        aria-expanded={showCalldata}
        aria-haspopup="dialog"
        aria-label="Revoke token approval"
        className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Revoke
      </button>
      {showCalldata && (
        <div
          role="dialog"
          aria-label="Revoke transaction calldata"
          className="absolute right-0 top-full z-10 mt-2 w-80 rounded-lg border border-white/10 bg-[#12121a] p-4 shadow-xl"
        >
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
            onClick={handleCopyToClipboard}
            className="w-full rounded-md bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-white/10"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  )
}
