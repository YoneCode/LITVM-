/**
 * Deploy the ERC-4626 LTCYieldVault (asset = WzkLTC, reward = VRT) to LitVM testnet,
 * then fund it with VRT so depositors can actually be paid.
 *
 *   cd contracts
 *   npx hardhat run scripts/deploy-ltcvault.js --network litvm_testnet
 *
 * Requires PRIVATE_KEY in ../.env (deployer must hold the VRT used for funding).
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const CONFIG = {
  rewardRatePerSec: hre.ethers.parseUnits("0.001", 18), // 1e15 = 86.4 VRT/day total
  fundVRT: hre.ethers.parseUnits("1000000", 18), // 1,000,000 VRT
};

async function main() {
  const net = await hre.ethers.provider.getNetwork();
  if (Number(net.chainId) !== 4441) throw new Error(`Wrong network ${net.chainId}; use --network litvm_testnet`);

  const [deployer] = await hre.ethers.getSigners();
  const d = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "deployments.json"), "utf8"));
  const WZKLTC = d.contracts.WzkLTC;
  const VRT = d.contracts.VaultRewardToken;
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Asset  WzkLTC: ${WZKLTC}`);
  console.log(`Reward VRT:    ${VRT}\n`);

  const Vault = await hre.ethers.getContractFactory("LTCYieldVault");
  const vault = await Vault.deploy(WZKLTC, VRT, CONFIG.rewardRatePerSec, deployer.address);
  await vault.waitForDeployment();
  const addr = await vault.getAddress();
  console.log(`LTCYieldVault deployed -> ${addr}`);

  const vrt = await hre.ethers.getContractAt("VaultRewardToken", VRT);
  const bal = await vrt.balanceOf(deployer.address);
  if (bal < CONFIG.fundVRT) throw new Error(`VRT balance ${hre.ethers.formatUnits(bal, 18)} < fund ${hre.ethers.formatUnits(CONFIG.fundVRT, 18)}`);
  console.log(`Funding vault with ${hre.ethers.formatUnits(CONFIG.fundVRT, 18)} VRT…`);
  await (await vrt.approve(addr, CONFIG.fundVRT)).wait();
  await (await vault.fundRewards(CONFIG.fundVRT)).wait();

  const out = {
    network: "litvm_testnet",
    chainId: 4441,
    deployer: deployer.address,
    ltcYieldVault: {
      address: addr,
      asset: WZKLTC,
      rewardToken: VRT,
      rewardRatePerSec: CONFIG.rewardRatePerSec.toString(),
      fundedVRT: CONFIG.fundVRT.toString(),
    },
  };
  fs.writeFileSync(path.resolve(__dirname, "..", "deployments.ltcvault.json"), JSON.stringify(out, null, 2));
  console.log("\n✅ Done. Address saved to contracts/deployments.ltcvault.json");
  console.log(`Verify: npx hardhat verify --network litvm_testnet ${addr} ${WZKLTC} ${VRT} ${CONFIG.rewardRatePerSec} ${deployer.address}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
