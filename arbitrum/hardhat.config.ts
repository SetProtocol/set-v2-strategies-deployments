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
      accounts: getHardhatPrivateKeys(),
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      timeout: 100000,
    },
    // rinkeby-arbitrum testnet
    rinkeby: {
      // Infura url = https://arbitrum-rinkeby.infura.io/v3/
      // Infura arbitrum maybe be a paid service, this is free
      url: "https://rinkeby.arbitrum.io/rpc",
      // @ts-ignore
      accounts: [`0x${process.env.RINKEBY_DEPLOY_PRIVATE_KEY}`],
      gasPrice: 0,
    },
    staging_mainnet: {
      url: "https://arbitrum-mainnet.infura.io/v3/" + process.env.INFURA_TOKEN,
      // @ts-ignore
      accounts: [`0x${process.env.STAGING_ARBITRUM_DEPLOY_PRIVATE_KEY}`],
    },
    production: {
      url: "https://arbitrum-mainnet.infura.io/v3/" + process.env.INFURA_TOKEN,
      // @ts-ignore
      accounts: [`0x${process.env.PRODUCTION_ARBITRUM_DEPLOY_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`,
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
    tests: "arbitrum/test",
    deploy: "arbitrum/deploy",
    deployments: "arbitrum/deployments",
  },
  // Load non-set-v2 artifacts via hardhat-deploy:external config
  external: {
    contracts: [
      {
        artifacts: "./node_modules/@setprotocol/index-coop-contracts/artifacts",
      },
    ],
  },
  // @ts-ignore
  chain: "polygon",
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
