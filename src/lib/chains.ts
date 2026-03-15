import { defineChain } from 'viem'

const isDev = import.meta.env.DEV

export const rootstock = defineChain({
  id: 30,
  name: 'Rootstock',
  nativeCurrency: { name: 'RBTC', symbol: 'RBTC', decimals: 18 },
  rpcUrls: {
    default: { http: [isDev ? '/rpc/mainnet' : 'https://public-node.rsk.co'] },
  },
  blockExplorers: {
    default: { name: 'RSK Explorer', url: 'https://explorer.rsk.co' },
  },
})

export const rootstockTestnet = defineChain({
  id: 31,
  name: 'Rootstock Testnet',
  nativeCurrency: { name: 'tRBTC', symbol: 'tRBTC', decimals: 18 },
  rpcUrls: {
    default: { http: [isDev ? '/rpc/testnet' : 'https://public-node.testnet.rsk.co'] },
  },
  blockExplorers: {
    default: { name: 'RSK Explorer', url: 'https://explorer.testnet.rsk.co' },
  },
})
