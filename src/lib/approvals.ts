import type { Address, PublicClient } from 'viem'
import { decodeEventLog } from 'viem'
import type { NetworkId, ApprovalEntry } from '../types'
import { ERC20_ABI } from '../constants/abis'
import { RISK_ORDER } from '../constants/risk'
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

interface BlockscoutResponse {
  status: string
  message: string
  result: BlockscoutLog[] | string
}

const MAX_API_RESULT_SIZE = 10000
const MAX_RESPONSE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB

function isValidHexString(value: unknown, length?: number): value is string {
  if (typeof value !== 'string') return false
  if (!value.startsWith('0x')) return false
  if (!/^0x[0-9a-fA-F]*$/.test(value)) return false
  if (length !== undefined && value.length !== length) return false
  return true
}

function isValidBlockscoutLog(log: unknown): log is BlockscoutLog {
  if (typeof log !== 'object' || log === null) return false
  const obj = log as Record<string, unknown>

  if (!isValidHexString(obj.address, 42)) return false

  if (!Array.isArray(obj.topics)) return false
  if (obj.topics.length < 3) return false
  for (const topic of obj.topics) {
    if (!isValidHexString(topic)) return false
  }

  if (!isValidHexString(obj.data)) return false
  if (!isValidHexString(obj.blockNumber)) return false
  if (!isValidHexString(obj.transactionHash, 66)) return false

  return true
}

function validateResponseSize(response: Response): boolean {
  const contentLength = response.headers.get('content-length')
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    if (size > MAX_RESPONSE_SIZE_BYTES) {
      console.error(`Blockscout response too large: ${size} bytes (max: ${MAX_RESPONSE_SIZE_BYTES})`)
      return false
    }
  }
  return true
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

  if (!validateResponseSize(response)) {
    throw new Error('Explorer response too large. Please try a different address.')
  }

  let json: BlockscoutResponse
  try {
    json = await response.json() as BlockscoutResponse
  } catch {
    throw new Error('Invalid JSON response from explorer')
  }

  if (typeof json !== 'object' || json === null) {
    throw new Error('Invalid response structure from explorer')
  }

  if (typeof json.status !== 'string' || typeof json.message !== 'string') {
    throw new Error('Invalid response format from explorer')
  }

  if (json.status !== '1') {
    if (json.message === 'No records found') return []
    throw new Error(json.message || 'Failed to fetch logs from explorer')
  }

  if (!Array.isArray(json.result)) {
    if (json.result === 'No records found') return []
    throw new Error('Unexpected result format from explorer')
  }

  if (json.result.length > MAX_API_RESULT_SIZE) {
    onProgress?.(`Warning: Results truncated at ${MAX_API_RESULT_SIZE} events. Some approvals may be missing.`)
  }

  const validLogs: BlockscoutLog[] = []
  for (const log of json.result.slice(0, MAX_API_RESULT_SIZE)) {
    if (isValidBlockscoutLog(log)) {
      validLogs.push(log)
    }
  }

  if (validLogs.length < json.result.length) {
    const skipped = json.result.length - validLogs.length
    onProgress?.(`Skipped ${skipped} invalid log entries.`)
  }

  onProgress?.(`Found ${validLogs.length} approval events. Processing...`)

  const logs: ApprovalLog[] = []
  for (const log of validLogs) {
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

export interface FetchApprovalsResult {
  approvals: ApprovalEntry[]
  failedCount: number
}

export async function fetchApprovals(
  client: PublicClient,
  owner: Address,
  networkId: NetworkId,
  onProgress?: (message: string) => void,
): Promise<FetchApprovalsResult> {
  const allLogs = await fetchApprovalLogs(networkId, owner, onProgress)

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

  const BATCH_SIZE = 5
  const entries: ApprovalEntry[] = []
  let failedCount = 0

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
      } else {
        failedCount++
      }
    }

    onProgress?.(`Checking allowances... ${Math.min(i + BATCH_SIZE, approvalList.length)}/${approvalList.length}`)
  }

  onProgress?.('Done')
  return {
    approvals: entries.sort((a, b) => {
      return RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel]
    }),
    failedCount,
  }
}
