import { formatUnits, maxUint256 } from 'viem'

const MAX_UINT256 = maxUint256

function compareStringBigInt(a: string, b: string): number {
  const aLen = a.length
  const bLen = b.length
  if (aLen !== bLen) return aLen - bLen
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function formatWithSuffix(value: string): string {
  const THOUSAND = '1000'
  const MILLION = '1000000'
  const BILLION = '1000000000'

  if (compareStringBigInt(value, BILLION) >= 0) {
    const quotient = BigInt(value) / 1_000_000_000n
    const remainder = BigInt(value) % 1_000_000_000n
    if (remainder === 0n) return `${quotient}B`
    const quotientStr = quotient.toString()
    const remStr = remainder.toString().padStart(9, '0')
    return `${quotientStr}.${remStr.slice(0, 2)}B`
  }

  if (compareStringBigInt(value, MILLION) >= 0) {
    const quotient = BigInt(value) / 1_000_000n
    const remainder = BigInt(value) % 1_000_000n
    if (remainder === 0n) return `${quotient}M`
    const quotientStr = quotient.toString()
    const remStr = remainder.toString().padStart(6, '0')
    return `${quotientStr}.${remStr.slice(0, 2)}M`
  }

  if (compareStringBigInt(value, THOUSAND) >= 0) {
    const quotient = BigInt(value) / 1_000n
    const remainder = BigInt(value) % 1_000n
    if (remainder === 0n) return `${quotient}K`
    const quotientStr = quotient.toString()
    const remStr = remainder.toString().padStart(3, '0')
    return `${quotientStr}.${remStr.slice(0, 2)}K`
  }

  return value
}

export function formatAllowance(value: bigint, decimals: number, decimalsUnknown = false): string {
  if (value === 0n) return '0'
  if (value >= MAX_UINT256) return 'Unlimited'

  if (decimalsUnknown) return `${value.toString()} wei`

  const formatted = formatUnits(value, decimals)

  const [intPart, decPart = ''] = formatted.split('.')

  const result = formatWithSuffix(intPart)

  if (result.endsWith('B') || result.endsWith('M') || result.endsWith('K')) {
    return result
  }

  if (decPart !== '') {
    const trimmedDec = decPart.replace(/0+$/, '')
    if (trimmedDec.length > 0) {
      const decFirst4 = trimmedDec.slice(0, 4)
      if (decFirst4 !== '' && BigInt(decFirst4) > 0n) {
        const shortDec = decFirst4.replace(/0+$/, '') || '0'
        if (shortDec.length > 0 && shortDec !== '0') {
          return `${result}.${shortDec}`
        }
      }
    }
  }

  return result
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
