require("dotenv").config({ path: "../.env"});

let changedFiles; // tslint:disable-line

import { HardhatUserConfig } from "hardhat/config";
import { privateKeys } from "../utils/wallets";
import { validateEnvVars, checkForkedProviderEnvironment } from "../utils/validateEnvVars";

import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-deploy";
import "@nomiclabs/hardhat-etherscan";
import "../tasks";

validateEnvVars();
checkForkedProviderEnvironment();

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
        url: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_TOKEN}`,
      },
      accounts: getHardhatPrivateKeys(),
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      timeout: 100000,
    },
    // kovan-optimism testnet
    kovan: {
      // Infura url = https://optimism-kovan.infura.io/v3/
      // Infura optimism maybe be a paid service, this is free
      url: "https://kovan.optimism.io/",
      // @ts-ignore
      accounts: [`0x${process.env.KOVAN_DEPLOY_PRIVATE_KEY}`],
    },
    staging_mainnet: {
      url: "https://mainnet.optimism.io/",
      // @ts-ignore
      accounts: [`0x${process.env.STAGING_OPTIMISM_DEPLOY_PRIVATE_KEY}`],
    },
    production: {
      url: "https://mainnet.optimism.io/",
      // @ts-ignore
      accounts: [`0x${process.env.PRODUCTION_OPTIMISM_DEPLOY_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: `${process.env.OPTIMISTIC_API_KEY}`,
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
    tests: "optimism/test",
    deploy: "optimism/deploy",
    deployments: "optimism/deployments",
  },
  // Load non-set-v2 artifacts via hardhat-deploy:external config
  external: {
    contracts: [
      {
        artifacts: "./node_modules/@setprotocol/index-coop-contracts/artifacts",
      },
      {
        artifacts: "./node_modules/@perp/curie-contract/artifacts"
      }
    ],
  },
  // @ts-ignore
  chain: "optimism",
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
