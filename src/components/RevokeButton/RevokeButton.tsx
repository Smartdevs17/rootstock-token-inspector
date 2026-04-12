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
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const copyButtonRef = useRef<HTMLButtonElement>(null)

  const tx = useMemo(() => buildRevokeTransaction(tokenAddress, spender), [tokenAddress, spender])

  const closePopover = useCallback(() => {
    setShowCalldata(false)
  }, [])

  useEffect(() => {
    if (!showCalldata) return

    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closePopover()
        buttonRef.current?.focus()
        return
      }

      if (e.key === 'Tab' && popoverRef.current) {
        const focusable = [closeButtonRef.current, copyButtonRef.current].filter(Boolean) as HTMLButtonElement[]
        if (focusable.length === 0) return

        const currentIndex = focusable.indexOf(document.activeElement as HTMLButtonElement)
        const nextIndex = e.shiftKey
          ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
          : (currentIndex === -1 || currentIndex === focusable.length - 1 ? 0 : currentIndex + 1)

        e.preventDefault()
        focusable[nextIndex]?.focus()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        closePopover()
        buttonRef.current?.focus()
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
          ref={popoverRef}
          role="dialog"
          aria-label="Revoke transaction calldata"
          aria-modal="true"
          className="absolute right-0 top-full z-10 mt-2 w-80 rounded-lg border border-white/10 bg-[#12121a] p-4 shadow-xl"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-gray-400">
              Revoke Transaction Calldata
            </p>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => {
                closePopover()
                buttonRef.current?.focus()
              }}
              aria-label="Close revoke dialog"
              className="rounded-md px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-white/10"
            >
              Close
            </button>
          </div>
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
            ref={copyButtonRef}
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
