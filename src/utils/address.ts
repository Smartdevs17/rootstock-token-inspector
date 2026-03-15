import { isAddress, getAddress } from 'viem'
import type { Address } from 'viem'

export function validateAddress(input: string): Address | null {
  if (!isAddress(input)) return null
  try {
    return getAddress(input)
  } catch {
    return null
  }
}
