# Rootstock Token Approval & Allowance Inspector

A developer and wallet safety tool that lists all ERC-20 token approvals for a specified address on **Rootstock (RSK)**. It displays spender addresses, allowance amounts, highlights unlimited approvals, and shows risk indicators. Users can generate revoke transaction commands to take corrective action.

## Features

- **Approval Scanning** — Fetches all ERC-20 `Approval` events for any wallet address via the Rootstock Blockscout API
- **Live Allowance Verification** — Checks current on-chain allowances (not just historical event values)
- **Risk Classification** — Flags unlimited (`2^256 - 1`), high, normal, and revoked approvals with color-coded badges
- **Revoke Generation** — Generates `approve(spender, 0)` calldata for revoking risky approvals, with copy-to-clipboard
- **Sortable & Filterable Table** — Sort by token, spender, allowance, or risk level; toggle to hide revoked approvals
- **Network Toggle** — Switch between Rootstock Mainnet (chain ID 30) and Testnet (chain ID 31)
- **Known Token Registry** — Curated list of common RSK tokens (DOC, RIF, SOV, RDOC, BPRO, MOC, FISH, ZUSD, DLLR, rUSDT) with metadata caching

## Tech Stack

| Layer           | Technology                  |
| --------------- | --------------------------- |
| Framework       | React 18+ with TypeScript   |
| Blockchain      | Viem                        |
| Styling         | Tailwind CSS v4             |
| Build           | Vite                        |
| Package Manager | npm                         |
| Explorer API    | Rootstock Blockscout        |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Smartdevs17/rootstock-token-inspector.git
cd rootstock-token-inspector
npm install
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5173`. A Vite dev server proxy handles CORS for RPC and Blockscout API calls.

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── AddressInput/      # Wallet address input with validation
│   ├── ApprovalTable/     # Sortable approval results table
│   ├── Layout/            # App shell and header
│   ├── NetworkSelector/   # Mainnet/Testnet toggle
│   ├── RevokeButton/      # Revoke calldata generator
│   ├── RiskBadge/         # Color-coded risk level pills
│   └── SummaryStats/      # Dashboard stat cards
├── hooks/
│   └── useApprovals.ts    # Approval fetching state management
├── lib/
│   ├── approvals.ts       # Blockscout API log fetching + on-chain verification
│   ├── chains.ts          # Rootstock chain definitions
│   ├── client.ts          # Viem public client factory
│   ├── revoke.ts          # Revoke calldata encoding
│   ├── risk.ts            # Risk level classification
│   └── tokens.ts          # Token metadata resolver with caching
├── constants/
│   ├── abis.ts            # ERC-20 ABI fragments
│   └── tokens.ts          # Known token list and thresholds
├── types/
│   └── index.ts           # Shared TypeScript types
├── utils/
│   ├── address.ts         # Address validation
│   └── format.ts          # Allowance and address formatting
├── App.tsx
├── main.tsx
└── index.css
```

## How It Works

1. User enters a wallet address and selects Mainnet or Testnet
2. The app queries the Rootstock Blockscout API for all `Approval` event logs where the address is the owner
3. Events are deduplicated per (token, spender) pair, keeping only the latest
4. Current on-chain allowances are verified via `allowance(owner, spender)` calls to each token contract
5. Results are displayed in a sortable table with risk indicators
6. Users can generate `approve(spender, 0)` revoke calldata for any active approval

## Risk Levels

| Level      | Criteria                          | Badge Color |
| ---------- | --------------------------------- | ----------- |
| Critical   | Allowance >= `2^256 - 1`         | Red         |
| High       | Allowance >= 1 billion tokens     | Amber       |
| Normal     | Any other non-zero allowance      | Green       |
| Revoked    | Allowance is 0                    | Gray        |

## License

MIT
