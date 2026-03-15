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
  const { state, progress, fetch, reset } = useApprovals()

  const chain = networkId === 30 ? rootstock : rootstockTestnet
  const explorerUrl = chain.blockExplorers.default.url

  const handleSubmit = useCallback(
    (address: Address) => {
      fetch(address, networkId)
    },
    [fetch, networkId],
  )

  const handleNetworkChange = useCallback(
    (id: NetworkId) => {
      setNetworkId(id)
      reset()
    },
    [reset],
  )

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
          <AddressInput onSubmit={handleSubmit} isLoading={state.status === 'loading'} />
        </div>

        {/* Loading */}
        {state.status === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF9000] border-t-transparent" />
            <p className="text-sm text-gray-400">{progress}</p>
          </div>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <div className="w-full max-w-2xl rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">{state.error}</p>
          </div>
        )}

        {/* Results */}
        {state.status === 'success' && (
          <div className="flex w-full flex-col gap-6">
            {state.data.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-white/5 bg-[#1a1a2e] py-16">
                <svg className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
