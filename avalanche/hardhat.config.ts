require("dotenv").config({ path: "../.env"});

import { HardhatUserConfig } from "hardhat/config";
import { privateKeys } from "../utils/wallets";
import { validateEnvVars } from "../utils/validateEnvVars";

import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-deploy";
import "@nomiclabs/hardhat-etherscan";
import "../tasks";

validateEnvVars();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.6.10",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://api.avax.network/ext/bc/C/rpc",
      },
      accounts: getHardhatPrivateKeys(),
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      timeout: 100000,
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc/",
      // @ts-ignore
      accounts: [`0x${process.env.FUJI_DEPLOY_PRIVATE_KEY}`],
    },
    staging_mainnet: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      // @ts-ignore
      accounts: [`0x${process.env.AVAX_STAGING_MAINNET_DEPLOY_PRIVATE_KEY}`],
    },
    production: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      // @ts-ignore
      accounts: [`0x${process.env.AVAX_PRODUCTION_MAINNET_DEPLOY_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: `${process.env.SNOWTRACE_API_KEY}`,
  },
  // @ts-ignore
  typechain: {
    outDir: "./typechain",
    target: "ethers-v5",
    externalArtifacts: ["./external/**/*.json"]
  },
  mocha: {
    timeout: 100000,
  },
  paths: {
    root: "..",
    tests: "avalanche/test",
    deploy: "avalanche/deploy",
    deployments: "avalanche/deployments",
  },
  // Load non-set-v2 artifacts via hardhat-deploy:external config
  external: {
    contracts: [
      {
        // Path is relative to project root
        artifacts: "./node_modules/set-protocol-oracles/dist/artifacts/ts/",
      },
      {
        artifacts: "./node_modules/@setprotocol/index-coop-contracts/artifacts",
      },
    ],
  },
  // @ts-ignore
  chain: "avalanche",
};

function getHardhatPrivateKeys() {
  return privateKeys.map(key => {
    const ONE_MILLION_ETH = "1000000000000000000000000";
    return {
      privateKey: key,
      balance: ONE_MILLION_ETH,
    };
  });
}

export default config;
