import { isAddress, getAddress, keccak256, toBytes } from 'viem'
import type { Address } from 'viem'

const ROOTSTOCK_MAINNET_CHAIN_ID = 30
const ROOTSTOCK_TESTNET_CHAIN_ID = 31

function eip1191Checksum(address: string, chainId: number): string {
  const addressLower = address.toLowerCase()

  const chainIdStr = chainId.toString()
  const hashInput = chainIdStr + addressLower
  const hashHex = keccak256(toBytes(hashInput)).slice(2)

  let checksum = '0x'
  for (let i = 0; i < addressLower.length; i++) {
    const char = addressLower[i]
    const hashNibble = parseInt(hashHex[i], 16)

    if (char >= '0' && char <= '9') {
      checksum += char
    } else if (hashNibble >= 8) {
      checksum += char.toUpperCase()
    } else {
      checksum += char
    }
  }

  return checksum
}

export function validateAddress(input: string, chainId?: number): Address | null {
  const normalized = input.trim().toLowerCase()
  if (!isAddress(normalized)) return null

  const chainIdToUse = chainId ?? ROOTSTOCK_MAINNET_CHAIN_ID

  if (chainIdToUse === ROOTSTOCK_MAINNET_CHAIN_ID || chainIdToUse === ROOTSTOCK_TESTNET_CHAIN_ID) {
    const checksummed = eip1191Checksum(normalized, chainIdToUse)
    const inputHasMixedCase = /[A-F]/.test(input)

    if (inputHasMixedCase && input !== checksummed) {
      return null
    }
  }

  try {
    return getAddress(normalized)
  } catch {
    return null
  }
}
