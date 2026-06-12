/**
 * Deploy the corrected YieldFarm(s) to LitVM testnet.
 *
 * This replaces the broken reward path: depositing WzkLTC now earns CLAIMABLE VRT
 * per user, and (optionally) staking VRT earns VRT — both via YieldFarm.sol.
 *
 * It reuses the already-deployed WzkLTC and VRT tokens (from deployments.json),
 * deploys the farm(s), and funds each with VRT so rewards can actually be paid.
 *
 * SAFETY: this BROADCASTS real transactions and MOVES your VRT. It is not run
 * automatically. Review the CONFIG below, make sure your deployer holds enough
 * VRT, then run it yourself:
 *
 *     cd contracts
 *     npm install
 *     npx hardhat run scripts/deploy-rewardfarm.js --network litvm_testnet
 *
 * Requires PRIVATE_KEY in ../.env (the deployer must be the VRT holder/owner).
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/* ----------------------------- CONFIG ----------------------------- */
const CONFIG = {
  // emission rate in VRT per second (1e15 = 0.001 VRT/s = 86.4 VRT/day, total across stakers)
  ltcRewardRatePerSec: hre.ethers.parseUnits("0.001", 18),
  vrtRewardRatePerSec: hre.ethers.parseUnits("0.0005", 18),

  // how much VRT to seed each farm with for reward payouts
  ltcFundVRT: hre.ethers.parseUnits("1000000", 18), // 1,000,000 VRT
  vrtFundVRT: hre.ethers.parseUnits("500000", 18), //   500,000 VRT

  // deploy the VRT->VRT staking farm too? (fixes the no-yield staking product)
  deployVrtStakingFarm: true,
};

function loadDeployments() {
  const p = path.resolve(__dirname, "..", "deployments.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function saveFarms(data) {
  const p = path.resolve(__dirname, "..", "deployments.rewardfarms.json");
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  console.log(`\nSaved addresses → ${p}`);
}

async function deployFarm(name, stakeAddr, rewardAddr, rate, owner) {
  const Farm = await hre.ethers.getContractFactory("YieldFarm");
  const farm = await Farm.deploy(stakeAddr, rewardAddr, rate, owner);
  await farm.waitForDeployment();
  const addr = await farm.getAddress();
  console.log(`  ${name} deployed → ${addr}`);
  return { farm, addr };
}

async function fund(vrt, farm, farmAddr, amount, label) {
  const bal = await vrt.balanceOf(await vrt.runner.getAddress());
  if (bal < amount) {
    throw new Error(
      `Deployer VRT balance ${hre.ethers.formatUnits(bal, 18)} < required ${hre.ethers.formatUnits(amount, 18)} for ${label}. Lower CONFIG.*FundVRT or top up VRT.`
    );
  }
  console.log(`  funding ${label} with ${hre.ethers.formatUnits(amount, 18)} VRT…`);
  await (await vrt.approve(farmAddr, amount)).wait();
  await (await farm.fundRewards(amount)).wait();
}

async function main() {
  const net = await hre.ethers.provider.getNetwork();
  if (Number(net.chainId) !== 4441) {
    throw new Error(`Wrong network (chainId ${net.chainId}). Use --network litvm_testnet.`);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  const d = loadDeployments();
  const WZKLTC = d.contracts.WzkLTC;
  const VRT = d.contracts.VaultRewardToken;
  console.log(`Reusing WzkLTC ${WZKLTC}`);
  console.log(`Reusing VRT    ${VRT}\n`);

  const vrt = await hre.ethers.getContractAt("VaultRewardToken", VRT);

  const out = { network: "litvm_testnet", chainId: 4441, deployer: deployer.address, farms: {} };

  console.log("Deploying LTC yield farm (stake WzkLTC → earn VRT)…");
  const ltc = await deployFarm("WzkLTC→VRT farm", WZKLTC, VRT, CONFIG.ltcRewardRatePerSec, deployer.address);
  await fund(vrt, ltc.farm, ltc.addr, CONFIG.ltcFundVRT, "LTC farm");
  out.farms.ltcYieldFarm = {
    address: ltc.addr,
    stakeToken: WZKLTC,
    rewardToken: VRT,
    rewardRatePerSec: CONFIG.ltcRewardRatePerSec.toString(),
  };

  if (CONFIG.deployVrtStakingFarm) {
    console.log("\nDeploying VRT staking farm (stake VRT → earn VRT)…");
    const v = await deployFarm("VRT→VRT farm", VRT, VRT, CONFIG.vrtRewardRatePerSec, deployer.address);
    await fund(vrt, v.farm, v.addr, CONFIG.vrtFundVRT, "VRT farm");
    out.farms.vrtStakingFarm = {
      address: v.addr,
      stakeToken: VRT,
      rewardToken: VRT,
      rewardRatePerSec: CONFIG.vrtRewardRatePerSec.toString(),
    };
  }

  saveFarms(out);

  console.log("\n✅ Done. Next: put these addresses in the frontend (lib/chain.ts ADDRESSES)");
  console.log("   and verify with:");
  console.log(`   npx hardhat verify --network litvm_testnet ${ltc.addr} ${WZKLTC} ${VRT} ${CONFIG.ltcRewardRatePerSec} ${deployer.address}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
