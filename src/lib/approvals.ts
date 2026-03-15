import type { Address, PublicClient } from 'viem'
import { decodeEventLog } from 'viem'
import type { NetworkId, ApprovalEntry } from '../types'
import { ERC20_ABI } from '../constants/abis'
import { getTokenMetadata } from './tokens'
import { classifyRisk } from './risk'

const BLOCKSCOUT_API: Record<NetworkId, string> = {
  30: '/api/blockscout/mainnet',
  31: '/api/blockscout/testnet',
}

const BLOCKSCOUT_URLS: Record<NetworkId, string> = {
  30: 'https://rootstock.blockscout.com/api',
  31: 'https://rootstock-testnet.blockscout.com/api',
}

function getBlockscoutBase(networkId: NetworkId): string {
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  return isDev ? BLOCKSCOUT_API[networkId] : BLOCKSCOUT_URLS[networkId]
}

const APPROVAL_TOPIC = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'

interface BlockscoutLog {
  address: string
  topics: string[]
  data: string
  blockNumber: string
  transactionHash: string
}

interface ApprovalLog {
  address: Address
  owner: Address
  spender: Address
  value: bigint
  blockNumber: bigint
}

async function fetchApprovalLogs(
  networkId: NetworkId,
  owner: Address,
  onProgress?: (message: string) => void,
): Promise<ApprovalLog[]> {
  const base = getBlockscoutBase(networkId)
  const ownerTopic = '0x' + owner.slice(2).toLowerCase().padStart(64, '0')

  // Blockscout getLogs API: topic0 = Approval event, topic1 = owner
  const params = new URLSearchParams({
    module: 'logs',
    action: 'getLogs',
    fromBlock: '0',
    toBlock: 'latest',
    topic0: APPROVAL_TOPIC,
    topic1: ownerTopic,
    topic0_1_opr: 'and',
  })

  onProgress?.('Fetching approval events from explorer...')
  const response = await fetch(`${base}?${params}`)

  if (!response.ok) {
    throw new Error(`Explorer API returned ${response.status}`)
  }

  const json = await response.json() as { status: string; result: BlockscoutLog[] | string; message: string }

  if (json.status !== '1' || !Array.isArray(json.result)) {
    // status "0" with "No records found" is not an error, just empty
    if (json.message === 'No records found') return []
    throw new Error(json.message || 'Failed to fetch logs from explorer')
  }

  onProgress?.(`Found ${json.result.length} approval events. Processing...`)

  const logs: ApprovalLog[] = []
  for (const log of json.result) {
    try {
      const decoded = decodeEventLog({
        abi: ERC20_ABI,
        data: log.data as `0x${string}`,
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      })

      if (decoded.eventName === 'Approval') {
        const args = decoded.args as { owner: Address; spender: Address; value: bigint }
        logs.push({
          address: log.address as Address,
          owner: args.owner,
          spender: args.spender,
          value: args.value,
          blockNumber: BigInt(log.blockNumber),
        })
      }
    } catch {
      // Skip malformed logs
    }
  }

  return logs
}

export async function fetchApprovals(
  client: PublicClient,
  owner: Address,
  networkId: NetworkId,
  onProgress?: (message: string) => void,
): Promise<ApprovalEntry[]> {
  const allLogs = await fetchApprovalLogs(networkId, owner, onProgress)

  // Deduplicate: keep the latest approval per (token, spender) pair
  const latestApprovals = new Map<string, ApprovalLog>()
  for (const log of allLogs) {
    const key = `${log.address.toLowerCase()}:${log.spender.toLowerCase()}`
    const existing = latestApprovals.get(key)
    if (!existing || log.blockNumber > existing.blockNumber) {
      latestApprovals.set(key, log)
    }
  }

  const approvalList = Array.from(latestApprovals.values())
  onProgress?.(`Checking ${approvalList.length} current on-chain allowances...`)

  // Batch allowance + metadata checks in parallel (groups of 5)
  const BATCH_SIZE = 5
  const entries: ApprovalEntry[] = []

  for (let i = 0; i < approvalList.length; i += BATCH_SIZE) {
    const batch = approvalList.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map(async (log) => {
        const [currentAllowance, token] = await Promise.all([
          client.readContract({
            address: log.address,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [owner, log.spender],
          }) as Promise<bigint>,
          getTokenMetadata(client, log.address, networkId),
        ])

        return {
          token,
          spender: log.spender,
          allowance: currentAllowance,
          riskLevel: classifyRisk(currentAllowance),
          blockNumber: log.blockNumber,
        } satisfies ApprovalEntry
      }),
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        entries.push(result.value)
      }
    }

    onProgress?.(`Checking allowances... ${Math.min(i + BATCH_SIZE, approvalList.length)}/${approvalList.length}`)
  }

  onProgress?.('Done')
  return entries.sort((a, b) => {
    const riskOrder = { critical: 0, high: 1, normal: 2, revoked: 3 }
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
  })
}
