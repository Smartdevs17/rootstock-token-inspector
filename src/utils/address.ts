import { isAddress, getAddress } from 'viem'
import type { Address } from 'viem'

export function validateAddress(input: string): Address | null {
  const normalized = input.trim().toLowerCase()
  if (!isAddress(normalized)) return null

  try {
    return getAddress(normalized)
  } catch {
    return null
  }
}
