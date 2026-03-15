import { encodeFunctionData } from 'viem'
import type { Address } from 'viem'
import { ERC20_ABI } from '../constants/abis'

export function encodeRevokeCalldata(spender: Address): `0x${string}` {
  return encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [spender, 0n],
  })
}

export interface RevokeTransaction {
  to: Address
  data: `0x${string}`
  value: bigint
}

export function buildRevokeTransaction(
  tokenAddress: Address,
  spender: Address,
): RevokeTransaction {
  return {
    to: tokenAddress,
    data: encodeRevokeCalldata(spender),
    value: 0n,
  }
}
