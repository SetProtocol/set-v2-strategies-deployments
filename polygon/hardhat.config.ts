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
      hardfork: "istanbul",
      accounts: getHardhatPrivateKeys(),
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      timeout: 100000,
    },
    goerli: {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_TOKEN,
      // @ts-ignore
      accounts: [`0x${process.env.GOERLI_DEPLOY_PRIVATE_KEY}`],
    },
    mumbai: {
      // Infura polygon is a paid service, this is free
      url: "https://rpc-mumbai.maticvigil.com",
      // @ts-ignore
      accounts: [`0x${process.env.MUMBAI_DEPLOY_PRIVATE_KEY}`],
    },
    staging_mainnet: {
      url: "https://polygon-mainnet.infura.io/v3/" + process.env.INFURA_TOKEN,
      // @ts-ignore
      accounts: [`0x${process.env.STAGING_POLYGON_DEPLOY_PRIVATE_KEY}`],
    },
    production: {
      url: "https://polygon-mainnet.infura.io/v3/" + process.env.INFURA_TOKEN,
      // @ts-ignore
      accounts: [`0x${process.env.PRODUCTION_POLYGON_DEPLOY_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: `${process.env.POLYGONSCAN_API_KEY}`,
  },
  // @ts-ignore
  typechain: {
    outDir: "./typechain",
    target: "ethers-v5",
    externalArtifacts: ["./external/**/*.json"],
  },
  mocha: {
    timeout: 100000,
  },
  paths: {
    root: "..",
    tests: "polygon/test",
    deploy: "polygon/deploy",
    deployments: "polygon/deployments",
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
