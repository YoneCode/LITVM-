import { defineChain } from "viem";

/**
 * Single source of truth for the LitVM deployment.
 * Addresses + ABIs are ported verbatim from the working frontend/app.js,
 * which has been proven against the live contracts. Do not invent values here.
 */

export const PRIVY_APP_ID =
  process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "cmqa3nlyi00e70cjlybk2porb";

export const LITVM_RPC =
  process.env.NEXT_PUBLIC_LITVM_RPC ?? "https://liteforge.rpc.caldera.xyz/http";

export const EXPLORER = "https://liteforge.explorer.caldera.xyz";

export const ADDRESSES = {
  wzkltc: "0x323D1aB76a9e2AA63cda313A0709A7891cbEcc67",
  vrt: "0x62bf26Aa2eA6F24Edd94bd427F27cc01f37f9Ff4",
  faucet: "0x8E6804e22e89d16b4219c7b16F29693044141Ab3",
  // Corrected reward farms (deposits actually earn claimable VRT per user).
  // ltcVault: ERC-4626 WzkLTC vault that distributes VRT (the LTC earn path).
  // vrtFarm: stake VRT → earn VRT (MasterChef farm).
  ltcVault: "0x1fa8b99b6f91ED960F5Ff2B7f7f82FBfBd586c76",
  vrtFarm: "0xD352A21aa4562ea52fAe6A0cED290d6772FC6b8E",
  // legacy (kept for reference / explorer links; no longer used by the UI)
  ltcFarm: "0x00Ab77F155063D0184d21e25AE43Da6381bb6CBb",
  strategy: "0xB60D2cAc0BC5334e706391ee2Da5B513a0d704e6",
  vault: "0x6522245155A9EfAAb6686d22d4d46D906FB27A32",
  timelockStaking: "0xC702D4A4267Cb1fe6209BccA03B8551A573b5d0a",
} as const;

export const CHAIN_ID = 4441;
export const CHAIN_ID_HEX = "0x1159";

/** viem chain object — Privy needs this in supportedChains. */
export const litvmChain = defineChain({
  id: CHAIN_ID,
  name: "LitVM LiteForge Testnet",
  nativeCurrency: { name: "zkLTC", symbol: "zkLTC", decimals: 18 },
  rpcUrls: {
    default: { http: [LITVM_RPC] },
    public: { http: [LITVM_RPC] },
  },
  blockExplorers: {
    default: { name: "LiteForge Explorer", url: EXPLORER },
  },
  testnet: true,
});

/* ---------------- ABIs (human-readable, ethers v6) ---------------- */

export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
];

export const WZKLTC_ABI = [
  ...ERC20_ABI,
  "function deposit() payable",
  "function withdraw(uint256)",
];

export const FAUCET_ABI = [
  "function claim()",
  "function timeUntilClaim(address) view returns (uint256)",
  "function CLAIM_AMOUNT() view returns (uint256)",
  "function COOLDOWN() view returns (uint256)",
  "function lastClaim(address) view returns (uint256)",
  "event Claimed(address indexed user, uint256 amount)",
];

export const STRATEGY_ABI = [
  "function deposit(uint256)",
  "function withdraw(uint256) returns (uint256,uint256)",
  "function pendingRewards(address) view returns (uint256)",
  "function totalBalance() view returns (uint256)",
  "function rewardRate() view returns (uint256)",
  "function totalShares() view returns (uint256)",
  "function totalRewardsDistributed() view returns (uint256)",
];

export const VAULT_ABI = [
  "function deposit(uint256,address) returns (uint256)",
  "function withdraw(uint256,address,address) returns (uint256)",
  "function redeem(uint256,address,address) returns (uint256)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function convertToAssets(uint256) view returns (uint256)",
  "function convertToShares(uint256) view returns (uint256)",
  "function maxWithdraw(address) view returns (uint256)",
  "function paused() view returns (bool)",
  "function owner() view returns (address)",
  "function strategy() view returns (address)",
  "function totalRewardsDistributed() view returns (uint256)",
  "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
  "event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
];

export const TIMELOCK_ABI = [
  "function stake(uint256)",
  "function requestUnstake(uint256)",
  "function claim(uint256)",
  "function cancelUnstake(uint256)",
  "function stakedBalance(address) view returns (uint256)",
  "function totalStaked() view returns (uint256)",
  "function pendingUnstakeCount(address) view returns (uint256)",
  "function getActiveUnstakes(address) view returns (uint256[],uint256[],uint256[])",
  "function UNLOCK_PERIOD() view returns (uint256)",
  "event Staked(address indexed user, uint256 amount)",
  "event UnstakeRequested(address indexed user, uint256 amount, uint256 unlockTime, uint256 requestIndex)",
  "event Claimed(address indexed user, uint256 amount, uint256 requestIndex)",
];

/** The corrected reward farm (used for both WzkLTC→VRT and VRT→VRT). */
export const YIELDFARM_ABI = [
  "function stake(uint256)",
  "function withdraw(uint256)",
  "function claim()",
  "function emergencyWithdraw()",
  "function earned(address) view returns (uint256)",
  "function pendingRewards(address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function totalStaked() view returns (uint256)",
  "function rewardRate() view returns (uint256)",
  "function rewardPerDay() view returns (uint256)",
  "function rewardsAvailable() view returns (uint256)",
  "function totalRewardsClaimed() view returns (uint256)",
  "function paused() view returns (bool)",
  "function owner() view returns (address)",
  "function stakeToken() view returns (address)",
  "function rewardToken() view returns (address)",
  "event Staked(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event RewardPaid(address indexed user, uint256 amount)",
];

/** ERC-4626 LTC vault that also distributes VRT rewards (the LTC earn path). */
export const LTCVAULT_ABI = [
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  "function withdraw(uint256 assets, address receiver, address owner) returns (uint256)",
  "function redeem(uint256 shares, address receiver, address owner) returns (uint256)",
  "function maxWithdraw(address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function convertToAssets(uint256) view returns (uint256)",
  "function asset() view returns (address)",
  "function earned(address) view returns (uint256)",
  "function claim()",
  "function rewardRate() view returns (uint256)",
  "function rewardPerDay() view returns (uint256)",
  "function rewardsAvailable() view returns (uint256)",
  "function totalRewardsClaimed() view returns (uint256)",
  "function paused() view returns (bool)",
  "function owner() view returns (address)",
  "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
  "event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
  "event RewardPaid(address indexed user, uint256 amount)",
];

export function explorerTx(hash: string) {
  return `${EXPLORER}/tx/${hash}`;
}
export function explorerAddr(addr: string) {
  return `${EXPLORER}/address/${addr}`;
}
export function shortAddr(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}
