import type { Address } from 'viem'
import type { TokenMetadata } from '../types'

export const KNOWN_TOKENS_MAINNET: Record<Address, TokenMetadata> = {
  '0xe700691da7b9851f2f35f8b8182c69c53ccad9db': {
    address: '0xe700691da7b9851f2f35f8b8182c69c53ccad9db',
    name: 'Dollar on Chain',
    symbol: 'DOC',
    decimals: 18,
  },
  '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5': {
    address: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
    name: 'RIF Token',
    symbol: 'RIF',
    decimals: 18,
  },
  '0xefc78fc7d48b64958315571571c2e16d3f5e5005': {
    address: '0xefc78fc7d48b64958315571571c2e16d3f5e5005',
    name: 'Sovryn Token',
    symbol: 'SOV',
    decimals: 18,
  },
  '0x2d919f19d4892381d58edebeca66d5642cef1a1f': {
    address: '0x2d919f19d4892381d58edebeca66d5642cef1a1f',
    name: 'RIF Dollar on Chain',
    symbol: 'RDOC',
    decimals: 18,
  },
  '0x440cd83c160de5c96ddb20246815ea44c7abbca8': {
    address: '0x440cd83c160de5c96ddb20246815ea44c7abbca8',
    name: 'BitPro',
    symbol: 'BPRO',
    decimals: 18,
  },
  '0x9ac7fe28967b30e3a4e6e03286d715b42b453d10': {
    address: '0x9ac7fe28967b30e3a4e6e03286d715b42b453d10',
    name: 'Money on Chain',
    symbol: 'MOC',
    decimals: 18,
  },
  '0x055a902303746382fbb7d18f6ae0df56efdc5213': {
    address: '0x055a902303746382fbb7d18f6ae0df56efdc5213',
    name: 'BabelFish',
    symbol: 'FISH',
    decimals: 18,
  },
  '0xdB107FA69E33f05180a4C2cE9c2E7CB481645C2d': {
    address: '0xdB107FA69E33f05180a4C2cE9c2E7CB481645C2d',
    name: 'ZUSD',
    symbol: 'ZUSD',
    decimals: 18,
  },
  '0xc1411567d2670e24d9c4daaa7cda95686e1cb18a': {
    address: '0xc1411567d2670e24d9c4daaa7cda95686e1cb18a',
    name: 'DLLR',
    symbol: 'DLLR',
    decimals: 18,
  },
  '0xef213441a85df4d7acbdae0cf78004e1e486bb96': {
    address: '0xef213441a85df4d7acbdae0cf78004e1e486bb96',
    name: 'rUSDT',
    symbol: 'rUSDT',
    decimals: 18,
  },
}

export const KNOWN_TOKENS_TESTNET: Record<Address, TokenMetadata> = {}

/** The max uint256 value, used to detect unlimited approvals */
export const MAX_UINT256 = 2n ** 256n - 1n

/** Threshold above which an approval is considered "high" risk (1 billion tokens with 18 decimals) */
export const HIGH_RISK_THRESHOLD = 10n ** 27n
