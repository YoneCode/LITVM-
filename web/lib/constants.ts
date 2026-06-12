/**
 * Single source of truth for product facts.
 * All figures and addresses are pulled from the dashboard / README,
 * so marketing copy can never drift from the real protocol.
 */

export const PRODUCT = {
  name: "LitVM Yield",
  chainLabel: "Testnet",
  // The console lives in this same app — landing CTAs route straight into it.
  appUrl: "/dashboard",
  explorer: "https://liteforge.explorer.caldera.xyz",
} as const;

export const NETWORK = {
  name: "LitVM LiteForge Testnet",
  chainId: 4441,
  rpc: "https://liteforge.rpc.caldera.xyz/http",
  gasToken: "zkLTC",
} as const;

export type Contract = {
  name: string;
  address: string;
  short: string;
  role: string;
};

export const CONTRACTS: Contract[] = [
  {
    name: "WzkLTC",
    address: "0x323D1aB76a9e2AA63cda313A0709A7891cbEcc67",
    short: "0x323D…cc67",
    role: "Wrapped zkLTC (WETH pattern)",
  },
  {
    name: "LTC Yield Farm",
    address: "0x00Ab77F155063D0184d21e25AE43Da6381bb6CBb",
    short: "0x00Ab…6CBb",
    role: "Stake WzkLTC → earn VRT",
  },
  {
    name: "VRT Farm",
    address: "0xD352A21aa4562ea52fAe6A0cED290d6772FC6b8E",
    short: "0xD352…6b8E",
    role: "Stake VRT → earn VRT",
  },
  {
    name: "Faucet",
    address: "0x8E6804e22e89d16b4219c7b16F29693044141Ab3",
    short: "0x8E68…1Ab3",
    role: "10 VRT / 24h / address",
  },
];

export const FOOTER_LINKS = [
  { label: "LitVM", href: "https://litvm.com" },
  { label: "Explorer", href: "https://liteforge.explorer.caldera.xyz" },
  { label: "Builders", href: "https://builders.litvm.com" },
];

/** Project socials (real accounts). */
export const SOCIALS = {
  github: "https://github.com/YoneCode/LITVM-",
  x: "https://x.com/LitVM_Yield",
} as const;

/** Protocol stat bar — mirrors the dashboard's live header. */
export const PROTOCOL_STATS = [
  { label: "LTC Vault TVL", value: "1,284.6", unit: "WzkLTC" },
  { label: "VRT Staked", value: "412,900", unit: "VRT" },
  { label: "VRT Emission", value: "8.0", unit: "%" },
  { label: "Rewards Distributed", value: "96,140", unit: "VRT" },
];
