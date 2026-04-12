import type { Address, PublicClient } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearTokenMetadataCache, getTokenMetadata } from './tokens'

const ZUSD = '0xdb107fa69e33f05180a4c2ce9c2e7cb481645c2d' as Address
const UNKNOWN = '0x4444444444444444444444444444444444444444' as Address

describe('getTokenMetadata', () => {
  beforeEach(() => {
    clearTokenMetadataCache()
  })

  it('returns known token metadata from a lowercase address lookup', async () => {
    const client = { readContract: vi.fn() } as unknown as PublicClient
    const metadata = await getTokenMetadata(client, ZUSD, 30)

    expect(metadata.symbol).toBe('ZUSD')
    expect(client.readContract).not.toHaveBeenCalled()
  })

  it('caches fetched metadata by network and token', async () => {
    const readContract = vi.fn()
      .mockResolvedValueOnce('Unknown Token')
      .mockResolvedValueOnce('UNK')
      .mockResolvedValueOnce(18)

    const client = { readContract } as unknown as PublicClient

    const first = await getTokenMetadata(client, UNKNOWN, 30)
    const second = await getTokenMetadata(client, UNKNOWN, 30)

    expect(first).toEqual(second)
    expect(readContract).toHaveBeenCalledTimes(3)
  })
})
