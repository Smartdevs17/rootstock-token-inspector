import { useCallback, useEffect, useRef, useState } from 'react'
import type { Address } from 'viem'
import type { ApprovalEntry, FetchState, NetworkId } from '../types'
import { getClient } from '../lib/client'
import { fetchApprovals as loadApprovals } from '../lib/approvals'

interface UseApprovalsReturn {
  state: FetchState<ApprovalEntry[]>
  progress: string
  fetchApprovals: (owner: Address, networkId: NetworkId) => Promise<void>
  reset: () => void
}

export function useApprovals(): UseApprovalsReturn {
  const [state, setState] = useState<FetchState<ApprovalEntry[]>>({ status: 'idle' })
  const [progress, setProgress] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  const fetchApprovals = useCallback(async (owner: Address, networkId: NetworkId) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++requestIdRef.current

    setState({ status: 'loading' })
    setProgress('Starting...')

    try {
      const client = getClient(networkId)
      const result = await loadApprovals(client, owner, networkId, (message: string) => {
        if (requestIdRef.current === requestId) {
          setProgress(message)
        }
      }, controller.signal)

      if (requestIdRef.current !== requestId || controller.signal.aborted) return

      setState({ status: 'success', data: result.approvals, failedCount: result.failedCount })
    } catch (err) {
      if (controller.signal.aborted || requestIdRef.current !== requestId) return

      const message = err instanceof Error ? err.message : 'Failed to fetch approvals'
      setState({ status: 'error', error: message })
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState({ status: 'idle' })
    setProgress('')
  }, [])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  return { state, progress, fetchApprovals, reset }
}
