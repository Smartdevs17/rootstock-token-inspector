import type { RiskLevel } from '../types'

export const RISK_ORDER: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  revoked: 3,
}
