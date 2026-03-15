import type { Address, PublicClient } from 'viem'
import type { NetworkId, TokenMetadata } from '../types'
import { KNOWN_TOKENS_MAINNET, KNOWN_TOKENS_TESTNET } from '../constants/tokens'
import { ERC20_ABI } from '../constants/abis'

const metadataCache = new Map<string, TokenMetadata>()

function getKnownTokens(networkId: NetworkId): Record<Address, TokenMetadata> {
  return networkId === 30 ? KNOWN_TOKENS_MAINNET : KNOWN_TOKENS_TESTNET
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
    metadataCache.set(cacheKey, known)
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
    metadataCache.set(cacheKey, metadata)
    return metadata
  } catch {
    const fallback: TokenMetadata = {
      address: tokenAddress,
      name: `Unknown (${tokenAddress.slice(0, 8)}...)`,
      symbol: '???',
      decimals: 18,
    }
    metadataCache.set(cacheKey, fallback)
    return fallback
  }
}
