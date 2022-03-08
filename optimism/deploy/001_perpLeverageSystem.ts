import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ZERO } from "@utils/constants";
import { BigNumber } from "ethers";

import {
  findDependency,
  getContractAddress,
  getCurrentStage,
  saveContractDeployment
} from "@utils/outputHelper";

import {
  PerpV2ContractSettings
} from "./../deployments/utils/types";

import {
  addExtension,
  deployBaseManager,
  prepareDeployment,
  stageAlreadyFinished,
  trackFinishedStage,
  updateSetManager,
} from "@utils/deploys/deployUtils";

import {
  DEPENDENCY
} from "./../deployments/utils/dependencies";

import {
  CONTRACT_NAMES,
  EXCHANGE_SETTINGS,
  EXECUTION_SETTINGS,
  INCENTIVE_SETTINGS,
  METHODOLOGY_SETTINGS,
  ETH_DECIMALS,
  ETH_USDC_PRICE_FEED_DECIMALS,
} from "./../deployments/constants/001_perpLeverageSystem";

const {
  TEST_PERP_TOKEN,
  PERPV2_ACCOUNT_BALANCE,
  PERPV2_LEVERAGE_MODULE,
  V_ETH,
  V_USD,
  ETH_CHAINLINK_ORACLE,
} = DEPENDENCY;
const CURRENT_STAGE = getCurrentStage(__filename);


const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {
  const {
    deploy,
    deployer,
    networkConstant
  } = await prepareDeployment(hre);

  // Deploy BaseManager
  await deployBaseManager(
    hre,
    CONTRACT_NAMES.BASE_MANAGER,
    TEST_PERP_TOKEN,
    deployer,
    deployer
  );

  // Deploy strategy extension
  await deployPerpLeverageStrategyExtension();

  // Add strategy extension to manager
  await addExtension(hre, CONTRACT_NAMES.BASE_MANAGER, CONTRACT_NAMES.LEVERAGE_EXTENSION);

  // Set manager to BaseManager
  if (networkConstant !== "development") {
    await updateSetManager(hre, TEST_PERP_TOKEN, CONTRACT_NAMES.BASE_MANAGER);
  }

  async function deployPerpLeverageStrategyExtension(): Promise<void> {
    const checkLeverageStrategyExtensionAddress = await getContractAddress(CONTRACT_NAMES.LEVERAGE_EXTENSION);
    if (checkLeverageStrategyExtensionAddress == "") {
      const manager = await getContractAddress(CONTRACT_NAMES.BASE_MANAGER);

      const contractSettings: PerpV2ContractSettings = {
        setToken: await findDependency(TEST_PERP_TOKEN),
        perpV2LeverageModule: await findDependency(PERPV2_LEVERAGE_MODULE),
        perpV2AccountBalance: await findDependency(PERPV2_ACCOUNT_BALANCE),
        baseUSDPriceOracle: await findDependency(ETH_CHAINLINK_ORACLE),
        twapInterval: ZERO,
        basePriceDecimalAdjustment: BigNumber.from(ETH_DECIMALS).sub(ETH_USDC_PRICE_FEED_DECIMALS),
        virtualBaseAddress: await findDependency(V_ETH),
        virtualQuoteAddress: await findDependency(V_USD)
      };

      const methodlogySettings = METHODOLOGY_SETTINGS;
      const executionSettings = EXECUTION_SETTINGS;
      const exchangeSettigns = EXCHANGE_SETTINGS;
      const incentiveSettings = INCENTIVE_SETTINGS;

      const constructorArgs = [
        manager,
        contractSettings,
        methodlogySettings,
        executionSettings,
        incentiveSettings,
        exchangeSettigns
      ];

      const extensionDeploy = await deploy(CONTRACT_NAMES.LEVERAGE_EXTENSION, {
        from: deployer,
        args: constructorArgs,
        log: true
      });

      extensionDeploy.receipt && await saveContractDeployment({
        name: CONTRACT_NAMES.LEVERAGE_EXTENSION,
        contractAddress: extensionDeploy.address,
        id: extensionDeploy.receipt.transactionHash,
        description: "Deployed PerpV2LeverageStrategyExtension",
        constructorArgs
      });
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;
