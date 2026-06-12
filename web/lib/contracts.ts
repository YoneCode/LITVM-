import { ethers } from "ethers";
import {
  LITVM_RPC,
  ADDRESSES,
  ERC20_ABI,
  WZKLTC_ABI,
  FAUCET_ABI,
  STRATEGY_ABI,
  VAULT_ABI,
  TIMELOCK_ABI,
  YIELDFARM_ABI,
} from "@/lib/chain";

/**
 * Read-only provider for public data — no wallet required.
 * The dashboard reads protocol stats through this even before a user connects.
 */
let _ro: ethers.JsonRpcProvider | null = null;
export function readProvider(): ethers.JsonRpcProvider {
  if (!_ro) {
    _ro = new ethers.JsonRpcProvider(LITVM_RPC, undefined, {
      // batch + poll politely; this is a public testnet RPC
      staticNetwork: true,
    });
  }
  return _ro;
}

/** Read-only contract instances bound to the public provider. */
export function readContracts(provider: ethers.Provider = readProvider()) {
  return {
    wzkltc: new ethers.Contract(ADDRESSES.wzkltc, WZKLTC_ABI, provider),
    vrt: new ethers.Contract(ADDRESSES.vrt, ERC20_ABI, provider),
    faucet: new ethers.Contract(ADDRESSES.faucet, FAUCET_ABI, provider),
    strategy: new ethers.Contract(ADDRESSES.strategy, STRATEGY_ABI, provider),
    vault: new ethers.Contract(ADDRESSES.vault, VAULT_ABI, provider),
    timelock: new ethers.Contract(ADDRESSES.timelockStaking, TIMELOCK_ABI, provider),
    ltcFarm: new ethers.Contract(ADDRESSES.ltcFarm, YIELDFARM_ABI, provider),
    vrtFarm: new ethers.Contract(ADDRESSES.vrtFarm, YIELDFARM_ABI, provider),
  };
}

/** Write contracts bound to a connected signer (for transactions). */
export function writeContracts(signer: ethers.Signer) {
  return {
    wzkltc: new ethers.Contract(ADDRESSES.wzkltc, WZKLTC_ABI, signer),
    vrt: new ethers.Contract(ADDRESSES.vrt, ERC20_ABI, signer),
    faucet: new ethers.Contract(ADDRESSES.faucet, FAUCET_ABI, signer),
    strategy: new ethers.Contract(ADDRESSES.strategy, STRATEGY_ABI, signer),
    vault: new ethers.Contract(ADDRESSES.vault, VAULT_ABI, signer),
    timelock: new ethers.Contract(ADDRESSES.timelockStaking, TIMELOCK_ABI, signer),
    ltcFarm: new ethers.Contract(ADDRESSES.ltcFarm, YIELDFARM_ABI, signer),
    vrtFarm: new ethers.Contract(ADDRESSES.vrtFarm, YIELDFARM_ABI, signer),
  };
}

export type ReadContracts = ReturnType<typeof readContracts>;
export type WriteContracts = ReturnType<typeof writeContracts>;
