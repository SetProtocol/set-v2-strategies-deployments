require("dotenv").config({ path: "../.env"});

let changedFiles; // tslint:disable-line

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
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_TOKEN}`,
      },
      accounts: getHardhatPrivateKeys(),
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      timeout: 100000,
    },
    kovan: {
      url: "https://kovan.infura.io/v3/" + process.env.INFURA_TOKEN,
      // @ts-ignore
      accounts: [`0x${process.env.KOVAN_DEPLOY_PRIVATE_KEY}`],
    },
    staging_mainnet: {
      url: "https://mainnet.infura.io/v3/" + process.env.INFURA_TOKEN,
      // @ts-ignore
      accounts: [`0x${process.env.STAGING_MAINNET_DEPLOY_PRIVATE_KEY}`],
    },
    production: {
      url: "https://mainnet.infura.io/v3/" + process.env.INFURA_TOKEN,
      // @ts-ignore
      accounts: [`0x${process.env.PRODUCTION_MAINNET_DEPLOY_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`,
  },
  // @ts-ignore
  typechain: {
    outDir: "./typechain",
    target: "ethers-v5",
    externalArtifacts: ["../node_modules/@setprotocol/set-protocol-v2/artifacts/**/*.json"]
  },
  mocha: {
    timeout: 100000,
  },
  paths: {
    root: "..",
    tests: "ethereum/test",
    deploy: "ethereum/deploy",
    deployments: "ethereum/deployments",
  },
  // Load non-set-v2 artifacts via hardhat-deploy:external config
  external: {
    contracts: [
      {
        artifacts: "./node_modules/@indexcoop/index-coop-smart-contracts/artifacts",
      },
    ],
  },
  // @ts-ignore
  chain: "ethereum",
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
