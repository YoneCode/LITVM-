# LitVM Yield

**Stake wrapped Litecoin, earn VRT.** A non-custodial single-sided staking farm on the
LitVM LiteForge testnet — Litecoin's zkEVM. Deposit `WzkLTC`, earn `VRT` rewards credited
per address on a reward-per-share basis, claimable any time, with no lock-up.

![LitVM](https://img.shields.io/badge/LitVM-LiteForge%20Testnet-E0883C?style=for-the-badge)
![Chain ID](https://img.shields.io/badge/Chain%20ID-4441-17140E?style=for-the-badge)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-2B2B2B?style=for-the-badge&logo=solidity&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Foundry tests](https://img.shields.io/badge/Foundry%20tests-12%2F12-3FAE5A?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-555555?style=for-the-badge)

---

## Protocol at a glance

| Property | Value |
|---|---|
| **Primitive** | Single-sided staking farm (reward-per-share, MasterChef-style accounting) |
| **Stake / earn** | `WzkLTC` to `VRT`  ·  `VRT` to `VRT` |
| **Reward model** | Fixed emission per second, split pro-rata by stake — no APR promised, no price oracle |
| **Per-action cost** | **O(1)** — stake / withdraw / claim touch only the caller's slot and one global accumulator |
| **Scalability** | No iteration over stakers; the same gas at 10 users or 100k+ users |
| **Custody** | Non-custodial. Principal is always withdrawable; reward payouts are balance-capped and never block a withdrawal |
| **Rewards reach** | Credited to each staker's address and claimable directly, not trapped in a vault |
| **Network fit** | Serves LitVM mission — enable yield-generation opportunities for LTC holders |

Every figure in the app is a live on-chain read, and the client-side reward tick is always
re-anchored to the contract's `earned()` so it can never overstate.

---

## How it works

1. **Wrap** — convert native `zkLTC` to `WzkLTC` (ERC-20, WETH pattern).
2. **Stake** — deposit `WzkLTC` into the LTC Yield Farm; the farm tracks your share of the pool.
3. **Earn** — `VRT` accrues to your address every second on a reward-per-share index.
4. **Claim / Withdraw** — claim `VRT` any time; withdraw principal any time (which also pays pending rewards).
5. **Compound** — stake earned `VRT` into the VRT Farm to earn more `VRT`.

A rate-limited faucet gives **10 VRT per address / 24h** so anyone can exercise the full flow.
`VRT` is a testnet reward token with no monetary value.

---

## Live deployment

- **Network:** LitVM LiteForge Testnet
- **Chain ID:** `4441`
- **RPC:** `https://liteforge.rpc.caldera.xyz/http`
- **Explorer:** [liteforge.explorer.caldera.xyz](https://liteforge.explorer.caldera.xyz)
- **Gas token:** `zkLTC`

### Contracts

| Contract | Address | Role |
|---|---|---|
| LTC Yield Farm | [`0x00Ab77F155063D0184d21e25AE43Da6381bb6CBb`](https://liteforge.explorer.caldera.xyz/address/0x00Ab77F155063D0184d21e25AE43Da6381bb6CBb) | Stake `WzkLTC` to earn `VRT` |
| VRT Farm | [`0xD352A21aa4562ea52fAe6A0cED290d6772FC6b8E`](https://liteforge.explorer.caldera.xyz/address/0xD352A21aa4562ea52fAe6A0cED290d6772FC6b8E) | Stake `VRT` to earn `VRT` |
| WzkLTC | [`0x323D1aB76a9e2AA63cda313A0709A7891cbEcc67`](https://liteforge.explorer.caldera.xyz/address/0x323D1aB76a9e2AA63cda313A0709A7891cbEcc67) | Wrapped zkLTC (ERC-20) |
| VaultRewardToken (VRT) | [`0x62bf26Aa2eA6F24Edd94bd427F27cc01f37f9Ff4`](https://liteforge.explorer.caldera.xyz/address/0x62bf26Aa2eA6F24Edd94bd427F27cc01f37f9Ff4) | Reward token · fixed 100M supply |
| TokenFaucet | [`0x8E6804e22e89d16b4219c7b16F29693044141Ab3`](https://liteforge.explorer.caldera.xyz/address/0x8E6804e22e89d16b4219c7b16F29693044141Ab3) | 10 VRT / 24h / address |

**Example on-chain stake transaction:**
[`0x7812e76b…e9aabbc`](https://liteforge.explorer.caldera.xyz/tx/0x7812e76b850cf7fec441cae39922a4fc90b3ac7ea24d871bed3d9b666e9aabbc)

---

## Architecture

```
.
├── contracts/                   Solidity (Foundry + Hardhat)
│   ├── src/YieldFarm.sol         reward-per-share staking farm (the core primitive)
│   ├── src/WzkLTC.sol            wrapped zkLTC (WETH pattern)
│   ├── src/VaultRewardToken.sol  VRT, fixed 100M supply
│   ├── src/TokenFaucet.sol       rate-limited faucet
│   ├── test/                     Foundry tests
│   └── scripts/                  deployment scripts
└── web/                         dApp (Next.js App Router)
    ├── app/                      landing (/) + console (/dashboard)
    ├── components/               UI + dashboard + providers
    └── lib/                      chain config, contract reads, tx engine
```

### The reward farm (`YieldFarm.sol`)

Each farm holds one global `accRewardPerShare` accumulator scaled by `1e18`. A staker's owed
rewards are `stake * accRewardPerShare / 1e18 - rewardDebt`. Deposits, withdrawals and claims
update only the caller's slot and the accumulator, so the protocol stays **O(1)** regardless of
how many stakers exist. Payouts are capped at the contract's available reward balance — and, in
the same-token case (`VRT` staked to earn `VRT`), the cap excludes staked principal — so rewards
can never be paid out of someone's principal and a shortfall degrades gracefully instead of
reverting withdrawals.

---

## Tech stack

**dApp**
- Next.js 14 (App Router, static export) · React 18 · TypeScript
- Tailwind CSS · Framer Motion (state-driven motion only)
- ethers v6 for on-chain reads/writes · Privy for wallet auth
- Command palette (⌘K), live per-second reward accrual, transaction engine with approval
  handling and human-readable errors

**Contracts**
- Solidity `0.8.20`, OpenZeppelin v4.9 (`ReentrancyGuard`, `Pausable`, `SafeERC20`, `Ownable`)
- Foundry for tests, Hardhat for deployment

**LitVM**
- Litecoin's zkEVM (Arbitrum Orbit + BitcoinOS), LiteForge testnet on Caldera

---

## Development

### Contracts

```
cd contracts
forge test          # 12/12 passing
npx hardhat compile
```

Deployment reads a private key from an untracked `.env` (never committed).

### dApp

```
cd web
npm install
npm run build       # static export to web/out
```

Wallet app id is read from `NEXT_PUBLIC_PRIVY_APP_ID` (with a safe fallback); RPC from
`NEXT_PUBLIC_LITVM_RPC`.

---

## Security

- `ReentrancyGuard` on every state-changing path; `SafeERC20` for all transfers.
- Owner-`Pausable` farms; constructors reject the zero address.
- Reward recovery can never touch staked principal or the reward pool.
- Reward payouts are balance-capped, so withdrawals are always honoured.
- All amounts handled as `uint256` wei; no floating point.

---

## Links

- X — [@LitVM_Yield](https://x.com/LitVM_Yield)
- GitHub — [YoneCode/LITVM-](https://github.com/YoneCode/LITVM-)
- LitVM — [litvm.com](https://litvm.com) · [docs](https://docs.litvm.com) · [builders](https://builders.litvm.com)

## License

MIT
