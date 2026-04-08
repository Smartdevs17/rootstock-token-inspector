import type { Address, PublicClient } from 'viem'
import type { NetworkId, TokenMetadata } from '../types'
import { KNOWN_TOKENS_MAINNET, KNOWN_TOKENS_TESTNET } from '../constants/tokens'
import { ERC20_ABI } from '../constants/abis'

const MAX_CACHE_SIZE = 100
const metadataCache = new Map<string, TokenMetadata>()
const cacheOrder: string[] = []

function getKnownTokens(networkId: NetworkId): Record<Address, TokenMetadata> {
  return networkId === 30 ? KNOWN_TOKENS_MAINNET : KNOWN_TOKENS_TESTNET
}

function addToCache(key: string, value: TokenMetadata) {
  if (metadataCache.has(key)) {
    const idx = cacheOrder.indexOf(key)
    if (idx !== -1) cacheOrder.splice(idx, 1)
  } else if (metadataCache.size >= MAX_CACHE_SIZE) {
    const oldest = cacheOrder.shift()
    if (oldest) metadataCache.delete(oldest)
  }
  metadataCache.set(key, value)
  cacheOrder.push(key)
}

export async function getTokenMetadata(
  client: PublicClient,
  tokenAddress: Address,
  networkId: NetworkId,
): Promise<TokenMetadata> {
  const cacheKey = `${networkId}:${tokenAddress.toLowerCase()}`
  const cached = metadataCache.get(cacheKey)
  if (cached) return cached

  const knownTokens = getKnownTokens(networkId)
  const known = knownTokens[tokenAddress.toLowerCase() as Address]
  if (known) {
    addToCache(cacheKey, known)
    return known
  }

  try {
    const [name, symbol, decimals] = await Promise.all([
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'name',
      }) as Promise<string>,
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }) as Promise<string>,
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }) as Promise<number>,
    ])

    const metadata: TokenMetadata = {
      address: tokenAddress,
      name,
      symbol,
      decimals,
    }
    addToCache(cacheKey, metadata)
    return metadata
  } catch {
    const fallback: TokenMetadata = {
      address: tokenAddress,
      name: `Unknown (${tokenAddress.slice(0, 8)}...)`,
      symbol: '???',
      decimals: 18,
      decimalsUnknown: true,
    }
    addToCache(cacheKey, fallback)
    return fallback
  }
}
