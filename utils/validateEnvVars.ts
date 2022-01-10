import chalk from "chalk";

const envVars = [
  "INFURA_TOKEN",
  "KOVAN_DEPLOY_PRIVATE_KEY",
  "STAGING_MAINNET_DEPLOY_PRIVATE_KEY",
  "PRODUCTION_MAINNET_DEPLOY_PRIVATE_KEY",
  "ETHERSCAN_API_KEY",
  "POLYGONSCAN_API_KEY",
  "ARBISCAN_API_KEY",
  "OPTIMISTIC_API_KEY",
  "GOERLI_DEPLOY_PRIVATE_KEY",
  "MUMBAI_DEPLOY_PRIVATE_KEY",
  "STAGING_POLYGON_DEPLOY_PRIVATE_KEY",
  "PRODUCTION_POLYGON_DEPLOY_PRIVATE_KEY",
  "RINKEBY_DEPLOY_PRIVATE_KEY",
  "STAGING_ARBITRUM_DEPLOY_PRIVATE_KEY",
  "PRODUCTION_ARBITRUM_DEPLOY_PRIVATE_KEY",
  "FUJI_DEPLOY_PRIVATE_KEY",
  "AVAX_STAGING_MAINNET_DEPLOY_PRIVATE_KEY",
  "AVAX_PRODUCTION_MAINNET_DEPLOY_PRIVATE_KEY",
  "STAGING_OPTIMISM_DEPLOY_PRIVATE_KEY",
  "PRODUCTION_OPTIMISM_DEPLOY_PRIVATE_KEY",
];

export function validateEnvVars() {
  const missingVars = [];

  for (const item of envVars) {
    if (process.env[item] === undefined) {
      missingVars.push(item);
    }
  }

  if (missingVars.length > 0) {
    let msg = chalk.red("There are missing environment variables in your `.env` file.\n");
    msg += chalk.red(JSON.stringify(missingVars, undefined, " "));
    throw new Error(msg);
  }
}
