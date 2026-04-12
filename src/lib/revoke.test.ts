import { decodeFunctionData } from 'viem'
import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'
import { ERC20_ABI } from '../constants/abis'
import { buildRevokeTransaction, encodeRevokeCalldata } from './revoke'

const TOKEN = '0x3333333333333333333333333333333333333333' as Address
const SPENDER = '0x2222222222222222222222222222222222222222' as Address

describe('revoke helpers', () => {
  it('encodes approve(spender, 0) calldata', () => {
    const calldata = encodeRevokeCalldata(SPENDER)
    const decoded = decodeFunctionData({
      abi: ERC20_ABI,
      data: calldata,
    })

    expect(decoded.functionName).toBe('approve')
    expect(decoded.args).toEqual([SPENDER, 0n])
  })

  it('builds a zero-value revoke transaction', () => {
    expect(buildRevokeTransaction(TOKEN, SPENDER)).toEqual({
      to: TOKEN,
      data: encodeRevokeCalldata(SPENDER),
      value: 0n,
    })
  })
})
