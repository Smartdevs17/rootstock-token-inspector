import { maxUint256 } from 'viem'
import { describe, expect, it } from 'vitest'
import { formatAllowance } from './format'

describe('formatAllowance', () => {
  it('formats zero as 0', () => {
    expect(formatAllowance(0n, 18)).toBe('0')
  })

  it('formats max uint256 as Unlimited', () => {
    expect(formatAllowance(maxUint256, 18)).toBe('Unlimited')
  })

  it('formats large values with suffixes', () => {
    expect(formatAllowance(1_500_000n, 0)).toBe('1.50M')
    expect(formatAllowance(1_234_567_890n, 0)).toBe('1.23B')
  })

  it('preserves small decimal precision without Number coercion', () => {
    expect(formatAllowance(123_400_000_000_000n, 18)).toBe('0.0001')
  })
})
