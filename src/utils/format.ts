import { formatUnits } from 'viem'
import { MAX_UINT256 } from '../constants/tokens'

export function formatAllowance(value: bigint, decimals: number): string {
  if (value === 0n) return '0'
  if (value >= MAX_UINT256) return 'Unlimited'

  const formatted = formatUnits(value, decimals)
  const num = parseFloat(formatted)

  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`
  if (num < 0.0001) return '<0.0001'
  return num.toFixed(4)
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
