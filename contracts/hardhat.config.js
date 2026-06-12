require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    litvm_testnet: {
      url: "https://liteforge.rpc.caldera.xyz/http",
      chainId: 4441,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    customChains: [
      {
        network: "litvm_testnet",
        chainId: 4441,
        urls: {
          apiURL: "https://liteforge.explorer.caldera.xyz/api",
          browserURL: "https://liteforge.explorer.caldera.xyz",
        },
      },
    ],
    apiKey: {
      litvm_testnet: "empty",
    },
  },
};
