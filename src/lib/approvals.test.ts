import type { Address, PublicClient } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import { fetchApprovals, getLatestApprovalLogs, parseApprovalLogs } from './approvals'

const APPROVAL_TOPIC = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
const OWNER = '0x1111111111111111111111111111111111111111' as Address
const SPENDER = '0x2222222222222222222222222222222222222222' as Address
const TOKEN = '0x3333333333333333333333333333333333333333' as Address

function topicForAddress(address: Address): `0x${string}` {
  return `0x${address.slice(2).toLowerCase().padStart(64, '0')}`
}

function hex32(value: bigint): `0x${string}` {
  return `0x${value.toString(16).padStart(64, '0')}`
}

describe('parseApprovalLogs', () => {
  it('parses valid approval logs and skips malformed addresses', () => {
    const parsed = parseApprovalLogs([
      {
        address: TOKEN,
        topics: [APPROVAL_TOPIC, topicForAddress(OWNER), topicForAddress(SPENDER)],
        data: hex32(25n),
        blockNumber: '0xa',
        transactionHash: `0x${'1'.repeat(64)}`,
      },
      {
        address: TOKEN,
        topics: [APPROVAL_TOPIC, '0x1234', topicForAddress(SPENDER)],
        data: hex32(50n),
        blockNumber: '0xb',
        transactionHash: `0x${'2'.repeat(64)}`,
      },
    ])

    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toMatchObject({
      address: TOKEN,
      owner: OWNER,
      spender: SPENDER,
      value: 25n,
      blockNumber: 10n,
    })
  })
})

describe('getLatestApprovalLogs', () => {
  it('deduplicates approvals by token and spender using the latest block', () => {
    const latest = getLatestApprovalLogs([
      { address: TOKEN, owner: OWNER, spender: SPENDER, value: 1n, blockNumber: 1n },
      { address: TOKEN, owner: OWNER, spender: SPENDER, value: 2n, blockNumber: 5n },
    ])

    expect(latest).toHaveLength(1)
    expect(latest[0]?.value).toBe(2n)
    expect(latest[0]?.blockNumber).toBe(5n)
  })
})

describe('fetchApprovals', () => {
  it('prefers the current on-chain allowance over the event log value', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: '1',
      message: 'OK',
      result: [
        {
          address: TOKEN,
          topics: [APPROVAL_TOPIC, topicForAddress(OWNER), topicForAddress(SPENDER)],
          data: hex32(100n),
          blockNumber: '0xa',
          transactionHash: `0x${'3'.repeat(64)}`,
        },
      ],
    }))))

    const readContract = vi.fn()
      .mockResolvedValueOnce(5n)
      .mockResolvedValueOnce('Token Name')
      .mockResolvedValueOnce('TKN')
      .mockResolvedValueOnce(18)

    const client = { readContract } as unknown as PublicClient
    const result = await fetchApprovals(client, OWNER, 30)

    expect(result.failedCount).toBe(0)
    expect(result.approvals).toHaveLength(1)
    expect(result.approvals[0]?.allowance).toBe(5n)
    expect(result.approvals[0]?.allowanceFromLog).toBe(false)
  })

  it('falls back to the event log allowance when allowance() fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: '1',
      message: 'OK',
      result: [
        {
          address: TOKEN,
          topics: [APPROVAL_TOPIC, topicForAddress(OWNER), topicForAddress(SPENDER)],
          data: hex32(42n),
          blockNumber: '0xa',
          transactionHash: `0x${'4'.repeat(64)}`,
        },
      ],
    }))))

    const readContract = vi.fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('Token Name')
      .mockResolvedValueOnce('TKN')
      .mockResolvedValueOnce(18)

    const client = { readContract } as unknown as PublicClient
    const result = await fetchApprovals(client, OWNER, 30)

    expect(result.approvals[0]?.allowance).toBe(42n)
    expect(result.approvals[0]?.allowanceFromLog).toBe(true)
  })
})
