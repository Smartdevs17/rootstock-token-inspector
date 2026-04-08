import { useState, useCallback } from 'react'
import type { Address } from 'viem'
import type { NetworkId } from './types'
import { Layout } from './components/Layout/Layout'
import { AddressInput } from './components/AddressInput/AddressInput'
import { NetworkSelector } from './components/NetworkSelector/NetworkSelector'
import { ApprovalTable } from './components/ApprovalTable/ApprovalTable'
import { SummaryStats } from './components/SummaryStats/SummaryStats'
import { useApprovals } from './hooks/useApprovals'
import { rootstock, rootstockTestnet } from './lib/chains'

function App() {
  const [networkId, setNetworkId] = useState<NetworkId>(30)
  const [inspectedAddress, setInspectedAddress] = useState<Address | null>(null)
  const { state, progress, fetch, reset } = useApprovals()

  const chain = networkId === 30 ? rootstock : rootstockTestnet
  const explorerUrl = (() => {
    const url = chain.blockExplorers.default.url
    try {
      const parsed = new URL(url)
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return parsed.origin
      }
      return 'https://explorer.rsk.co'
    } catch {
      return 'https://explorer.rsk.co'
    }
  })()

  const handleSubmit = useCallback(
    (address: Address) => {
      setInspectedAddress(address)
      fetch(address, networkId)
    },
    [fetch, networkId],
  )

  const handleNetworkChange = useCallback(
    (id: NetworkId) => {
      setNetworkId(id)
      setInspectedAddress(null)
      reset()
    },
    [reset],
  )

  const handleRetry = useCallback(() => {
    if (inspectedAddress) {
      fetch(inspectedAddress, networkId)
    }
  }, [inspectedAddress, fetch, networkId])

  return (
    <Layout>
      <div className="flex flex-col items-center gap-8">
        {/* Hero section */}
        <div className="flex flex-col items-center gap-4 pt-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Token Approval Inspector
          </h2>
          <p className="max-w-lg text-gray-400">
            Check and manage ERC-20 token approvals on Rootstock. Identify risky
            unlimited approvals and generate revoke transactions.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          <NetworkSelector value={networkId} onChange={handleNetworkChange} />
          <AddressInput onSubmit={handleSubmit} isLoading={state.status === 'loading'} networkId={networkId} />
        </div>

        {/* Loading */}
        {state.status === 'loading' && (
          <div className="w-full max-w-4xl space-y-3" role="status" aria-live="polite" aria-label="Loading approval data">
            <div className="h-12 w-full animate-pulse rounded-lg bg-[#1a1a2e]" />
            <div className="grid grid-cols-4 gap-4">
              <div className="h-20 animate-pulse rounded-lg bg-[#1a1a2e]" />
              <div className="h-20 animate-pulse rounded-lg bg-[#1a1a2e]" />
              <div className="h-20 animate-pulse rounded-lg bg-[#1a1a2e]" />
              <div className="h-20 animate-pulse rounded-lg bg-[#1a1a2e]" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-[#1a1a2e]" />
              ))}
            </div>
            <p className="text-center text-sm text-gray-400">{progress}</p>
          </div>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <div className="w-full max-w-2xl rounded-lg border border-red-500/20 bg-red-500/5 p-4" role="alert">
            <p className="text-sm text-red-400">{state.error}</p>
          </div>
        )}

        {/* Results */}
        {state.status === 'success' && (
          <div className="flex w-full flex-col gap-6" role="region" aria-label="Approval results" aria-live="polite">
            {state.failedCount && state.failedCount > 0 && (
              <div 
                className="flex items-center justify-between rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4"
                role="alert"
              >
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm text-yellow-300">
                    {state.failedCount} token{state.failedCount > 1 ? 's' : ''} failed to load. The approval list may be incomplete.
                  </p>
                </div>
                <button
                  onClick={handleRetry}
                  disabled={!inspectedAddress}
                  className="rounded-md bg-yellow-500/20 px-3 py-1.5 text-xs font-medium text-yellow-300 transition-colors hover:bg-yellow-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            )}
            {state.data.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-white/5 bg-[#1a1a2e] py-16">
                <svg className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium text-gray-300">No approvals found</p>
                <p className="text-sm text-gray-500">
                  This address has no ERC-20 token approvals on Rootstock {networkId === 30 ? 'Mainnet' : 'Testnet'}.
                </p>
              </div>
            ) : (
              <>
                <SummaryStats approvals={state.data} />
                <ApprovalTable approvals={state.data} explorerUrl={explorerUrl} />
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default App
