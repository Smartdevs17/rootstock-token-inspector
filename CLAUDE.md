# CLAUDE.md — Rootstock Token Approval & Allowance Inspector

## Project Overview

A developer and wallet safety tool that lists all ERC-20 token approvals for a specified address on **Rootstock (RSK)**. It displays spender addresses, allowance amounts, highlights unlimited approvals, and shows risk indicators. Users can generate revoke transaction commands. The goal is to make on-chain allowances transparent and actionable—helping developers and users detect risky approval states and take corrective action quickly.

**Repository:** <https://github.com/Smartdevs17/rootstock-token-inspector>
**Reference Implementation:** <https://github.com/Jon-Becker/revoke-finance>

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18+ with TypeScript (strict mode) |
| Blockchain | Viem (primary), Ethers.js v6 (secondary/utility) |
| Styling | Tailwind CSS |
| Build | Vite |
| Package Manager | npm |
| Chain Target | Rootstock Mainnet (chain ID 30) and Rootstock Testnet (chain ID 31) |

---

## Architecture & Core Concepts

### How It Works

1. User enters a wallet address.
2. The tool fetches all ERC-20 `Approval` events emitted for that address via JSON-RPC (`eth_getLogs`).
3. For each approval event, the tool decodes the `owner`, `spender`, and `value` fields.
4. Current on-chain allowances are verified by calling `allowance(owner, spender)` on each token contract.
5. Results are displayed in a table showing: token name/symbol, spender address, allowance amount, and risk level.
6. Unlimited approvals (`2^256 - 1` or excessively high values) are flagged with visual risk indicators.
7. Users can generate `approve(spender, 0)` revoke calldata or connect a wallet to execute revocations directly.

### Key Modules

- **Address Input & Validation** — Accepts RSK addresses, validates checksum (RSK uses EIP-1191 with chain ID), resolves RNS names if applicable.
- **Approval Fetcher** — Queries `Approval(address indexed owner, address indexed spender, uint256 value)` event logs from Rootstock RPC.
- **Allowance Checker** — Calls `allowance()` on-chain to get the live allowance (event logs can be stale if approvals were partially consumed).
- **Risk Analyzer** — Classifies approvals: unlimited (`>=2^256-1`), high (above a configurable threshold), normal, or zero/revoked.
- **Revoke Generator** — Produces the calldata for `approve(spender, 0)` transactions. Optionally supports wallet connection for direct execution.
- **Token Metadata Resolver** — Fetches `name()`, `symbol()`, `decimals()` for display. Cache results aggressively.

---

## Rootstock-Specific Details

### RPC Endpoints

```
Mainnet: https://public-node.rsk.co
Testnet: https://public-node.testnet.rsk.co
```

### Chain IDs

- Mainnet: `30`
- Testnet: `31`

### Address Format

Rootstock uses EIP-1191 checksummed addresses (incorporates chain ID into the checksum). Viem handles this natively when the chain is configured. Always configure the RSK chain object properly in Viem:

```typescript
import { defineChain } from 'viem'

export const rootstock = defineChain({
  id: 30,
  name: 'Rootstock',
  nativeCurrency: { name: 'RBTC', symbol: 'RBTC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://public-node.rsk.co'] },
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
    default: { http: ['https://public-node.testnet.rsk.co'] },
  },
  blockExplorers: {
    default: { name: 'RSK Explorer', url: 'https://explorer.testnet.rsk.co' },
  },
})
```

### Known ERC-20 Tokens on Rootstock

Include a curated token list for common RSK tokens (DOC, RIF, SOV, RDOC, BPRO, MOC, FISH, ZUSD, DLLR, rUSDT) with their contract addresses for enriched display. Fall back to on-chain metadata queries for unknown tokens.

---

## Coding Standards

### TypeScript

- **Strict mode enabled** — `"strict": true` in tsconfig.
- No `any` types. Use `unknown` + type guards where the type is genuinely unknown.
- Use discriminated unions for states (loading, error, success).
- Prefer `interface` for object shapes, `type` for unions/intersections.
- All blockchain addresses must use Viem's `Address` type (`` `0x${string}` ``), never raw `string`.
- All token amounts must be handled as `bigint`, never `number` or `string` arithmetic.

### React

- Functional components only. No class components.
- Custom hooks for all blockchain data fetching (`useApprovals`, `useTokenMetadata`, `useAllowance`).
- Proper error boundaries around blockchain interaction components.
- Loading skeletons, not spinners, for data-heavy views.
- All user-facing numbers must be formatted with proper decimal handling via `formatUnits` from Viem.

### Viem Usage (Primary Library)

Viem is the **primary** blockchain library. Use it for:
- Creating public clients (`createPublicClient`)
- Reading contracts (`readContract`)
- Fetching logs (`getLogs` with the `Approval` event ABI)
- Encoding calldata (`encodeFunctionData` for revoke transactions)
- Address utilities (`getAddress`, `isAddress`)

```typescript
import { createPublicClient, http, parseAbiItem } from 'viem'
import { rootstock } from './chains'

const client = createPublicClient({
  chain: rootstock,
  transport: http(),
})

// Fetch Approval events
const logs = await client.getLogs({
  event: parseAbiItem('event Approval(address indexed owner, address indexed spender, uint256 value)'),
  args: { owner: address },
  fromBlock: 0n,
  toBlock: 'latest',
})
```

### Ethers.js Usage (Secondary)

Only use Ethers.js v6 where Viem does not cover a specific need (e.g., certain wallet provider integrations, utilities not yet in Viem). Do not mix Ethers and Viem for the same operation. If Ethers is used, import only what you need—never `import { ethers } from 'ethers'`.

### File & Folder Structure

```
src/
├── components/        # React components
│   ├── AddressInput/
│   ├── ApprovalTable/
│   ├── RiskBadge/
│   ├── RevokeButton/
│   └── Layout/
├── hooks/             # Custom React hooks
│   ├── useApprovals.ts
│   ├── useAllowance.ts
│   └── useTokenMetadata.ts
├── lib/               # Core logic (non-React)
│   ├── chains.ts
│   ├── client.ts
│   ├── approvals.ts
│   ├── risk.ts
│   ├── revoke.ts
│   └── tokens.ts
├── types/             # Shared TypeScript types
│   └── index.ts
├── constants/         # Token lists, ABIs, thresholds
│   ├── abis.ts
│   └── tokens.ts
├── utils/             # Pure utility functions
│   ├── format.ts
│   └── address.ts
└── App.tsx
```

---

## Security & Package Audit Requirements

### CRITICAL: Zero Vulnerability Tolerance

Every npm package installation **must** pass a security audit. The project reviewers will reject any submission that shows vulnerabilities in `npm audit`.

**Before installing any package:**

```bash
# 1. Check the package on npm for maintenance status, download count, and known issues
# 2. Install the package
npm install <package>

# 3. Immediately run audit
npm audit

# 4. If vulnerabilities are found, attempt to fix
npm audit fix

# 5. If audit fix doesn't resolve, evaluate alternatives:
#    - Use a different package with no vulnerabilities
#    - Pin to a specific safe version
#    - If the vulnerability is in a dev dependency only and does not affect production, document it

# 6. NEVER use --force or --legacy-peer-deps to bypass audit warnings without understanding the implications
```

**Rules:**

- Run `npm audit` after every `npm install` and confirm zero vulnerabilities.
- Prefer packages with active maintenance (recent commits, high weekly downloads, no open CVEs).
- If a package has a vulnerability with no fix available, find an alternative or implement the functionality manually.
- Keep `package-lock.json` committed and up to date.
- Use exact versions (no `^` or `~`) for critical dependencies if stability is a concern.
- Do not use deprecated packages.
- Before adding any new dependency, ask: "Can this be done with what we already have (Viem, React, TypeScript)?"

### Dependency Minimalism

Keep the dependency tree lean. The core stack already provides most of what's needed:

- **HTTP/RPC calls** → Viem's built-in transport (do NOT add axios, fetch wrappers, etc.)
- **State management** → React's built-in useState/useReducer/useContext (do NOT add Redux, Zustand, etc. unless truly justified)
- **Styling** → Tailwind CSS (do NOT add styled-components, emotion, etc.)
- **Address/BigInt handling** → Viem utilities (do NOT add separate bignumber libraries)

---

## UI/UX Design Direction

### Aesthetic

Security-focused, dashboard-style interface. Dark theme primary (trust-evoking for crypto/security tools). Clean, data-dense layout inspired by block explorers and security audit dashboards.

### Color Palette

- **Background:** Dark charcoal/near-black (`#0a0a0f`, `#12121a`)
- **Surface:** Elevated dark cards (`#1a1a2e`, `#16213e`)
- **Primary accent:** Electric blue or teal (`#00d2ff`, `#0ea5e9`) — trust, technology
- **Risk - Critical:** Red (`#ef4444`) — unlimited approvals
- **Risk - High:** Orange/amber (`#f59e0b`) — unusually high approvals
- **Risk - Normal:** Green (`#22c55e`) — reasonable approvals
- **Risk - Revoked:** Muted gray (`#6b7280`) — zero allowance / already revoked
- **Text:** White primary, gray-400 secondary

### Key UI Elements

- **Address input** — Prominent, centered on landing. Supports paste, ENS/RNS resolution feedback.
- **Network selector** — Toggle between Mainnet and Testnet.
- **Approval table** — Sortable columns: Token, Spender, Allowance, Risk Level, Actions.
- **Risk badges** — Color-coded pills with icons (shield-check, alert-triangle, x-circle).
- **Revoke button** — Per-row action that generates or executes the revoke transaction.
- **Summary stats** — Total approvals, unlimited count, high-risk count, total tokens exposed.
- **Empty state** — Friendly message when no approvals are found.
- **Loading state** — Skeleton rows while fetching. Progress indicator for large histories.

### Accessibility

- All interactive elements must be keyboard accessible.
- Color is never the sole indicator of risk (always pair with text labels and icons).
- Minimum contrast ratio of 4.5:1 for text.

---

## Error Handling

- **Invalid address** → Inline validation message, do not submit.
- **RPC failure** → Retry with exponential backoff (3 attempts). Show user-friendly error with retry button.
- **Rate limiting** → Queue requests, show progress. RSK public nodes have rate limits.
- **No approvals found** → Distinct empty state (not an error).
- **Token metadata failure** → Show the contract address as fallback, never crash.

---

## Testing Guidelines

- Unit tests for all `lib/` modules (approval parsing, risk classification, revoke encoding).
- Component tests for critical UI flows (address input validation, approval table rendering, risk badge display).
- Use Vitest as the test runner.
- Mock RPC responses for deterministic tests—never hit live RPC in unit tests.

---

## Git & Workflow

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Branch naming: `feature/<name>`, `fix/<name>`, `chore/<name>`.
- PR descriptions must explain what changed and why.
- No commits with failing `npm audit` or TypeScript errors.

---

## Performance Considerations

- **Batch RPC calls** where possible (multicall for `allowance()` checks across multiple tokens).
- **Cache token metadata** in memory or localStorage — `name()`, `symbol()`, `decimals()` rarely change.
- **Paginate event log queries** if the address has a very long approval history — split into block ranges.
- **Debounce** address input to avoid spamming validation.

---

## Do NOT

- Do not use `any` type anywhere.
- Do not use `Number` for token amounts — always `bigint`.
- Do not store private keys or seed phrases anywhere in the codebase.
- Do not make the tool capable of executing transactions without explicit user confirmation.
- Do not add packages without running `npm audit` and confirming zero vulnerabilities.
- Do not bypass TypeScript strict mode or add `@ts-ignore` / `@ts-expect-error` without a documented reason.
- Do not use Ethers.js for something Viem already handles.
- Do not hardcode RPC URLs in components — centralize in `lib/chains.ts` or environment variables.
- Do not render raw `bigint` values to users — always format with proper decimals.
- Do not trust event log amounts as current allowances — always verify with a live `allowance()` call.
