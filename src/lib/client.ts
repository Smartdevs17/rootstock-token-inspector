import { createPublicClient, http } from 'viem'
import type { PublicClient } from 'viem'
import { rootstock, rootstockTestnet } from './chains'
import type { NetworkId } from '../types'

const clients: Record<NetworkId, PublicClient> = {
  30: createPublicClient({
    chain: rootstock,
    transport: http(),
  }),
  31: createPublicClient({
    chain: rootstockTestnet,
    transport: http(),
  }),
}

export function getClient(networkId: NetworkId): PublicClient {
  return clients[networkId]
}
