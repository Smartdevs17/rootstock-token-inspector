import { createPublicClient, http } from 'viem'
import type { PublicClient } from 'viem'
import { rootstock, rootstockTestnet } from './chains'
import type { NetworkId } from '../types'

const clientCache: Partial<Record<NetworkId, PublicClient>> = {}

export function getClient(networkId: NetworkId): PublicClient {
  const cached = clientCache[networkId]
  if (cached) return cached

  const client = createPublicClient({
    chain: networkId === 30 ? rootstock : rootstockTestnet,
    transport: http(),
  })

  clientCache[networkId] = client
  return client
}
