import { useState, useCallback } from 'react'
import type { Address } from 'viem'
import type { ApprovalEntry, FetchState, NetworkId } from '../types'
import { getClient } from '../lib/client'
import { fetchApprovals } from '../lib/approvals'

interface UseApprovalsReturn {
  state: FetchState<ApprovalEntry[]>
  progress: string
  fetch: (owner: Address, networkId: NetworkId) => Promise<void>
  reset: () => void
}

export function useApprovals(): UseApprovalsReturn {
  const [state, setState] = useState<FetchState<ApprovalEntry[]>>({ status: 'idle' })
  const [progress, setProgress] = useState('')

  const fetch = useCallback(async (owner: Address, networkId: NetworkId) => {
    setState({ status: 'loading' })
    setProgress('Starting...')

    try {
      const client = getClient(networkId)
      const approvals = await fetchApprovals(client, owner, networkId, setProgress)
      setState({ status: 'success', data: approvals })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch approvals'
      setState({ status: 'error', error: message })
    }
  }, [])

  const reset = useCallback(() => {
    setState({ status: 'idle' })
    setProgress('')
  }, [])

  return { state, progress, fetch, reset }
}
