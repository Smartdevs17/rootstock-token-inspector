import type { Address } from 'viem'

export type RiskLevel = 'critical' | 'high' | 'normal' | 'revoked'

export interface TokenMetadata {
  address: Address
  name: string
  symbol: string
  decimals: number
  decimalsUnknown?: boolean
}

export interface ApprovalEntry {
  token: TokenMetadata
  spender: Address
  allowance: bigint
  riskLevel: RiskLevel
  blockNumber: bigint
}

export type NetworkId = 30 | 31

export type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; failedCount?: number }
  | { status: 'error'; error: string }
