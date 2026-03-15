import type { RiskLevel } from '../types'
import { MAX_UINT256, HIGH_RISK_THRESHOLD } from '../constants/tokens'

export function classifyRisk(allowance: bigint): RiskLevel {
  if (allowance === 0n) return 'revoked'
  if (allowance >= MAX_UINT256) return 'critical'
  if (allowance >= HIGH_RISK_THRESHOLD) return 'high'
  return 'normal'
}
