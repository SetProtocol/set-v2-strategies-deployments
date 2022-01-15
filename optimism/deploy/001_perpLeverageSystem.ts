import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  findDependency,
  getContractAddress,
  getCurrentStage,
  saveContractDeployment,
  writeContractAndTransactionToOutputs
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
} from "./../deployments/constants/001_perpLeverageSystem";
import { getRandomAddress } from "@utils/accountUtils";
import { EMPTY_BYTES } from "@utils/constants";

const {
  TEST_PERP_TOKEN,
  PERPV2_ACCOUNT_BALANCE,
  PERPV2_LEVERAGE_MODULE,
  V_ETH,
  V_USD,
  ETH_CHAINLINK_ORACLE,
  USDC_CHAINLINK_ORACLE,
} = DEPENDENCY;
const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {
  const {
    deploy,
    deployer,
    networkConstant
  } = await prepareDeployment(hre);

  await polyFillForDevelopment();

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

  async function polyFillForDevelopment(): Promise<void> {
    if (await findDependency(TEST_PERP_TOKEN) === "") {
      await writeContractAndTransactionToOutputs(TEST_PERP_TOKEN, await getRandomAddress(), EMPTY_BYTES, "Create Mock TEST PERP TOKEN");
    }

    if (await findDependency(V_ETH) === "") {
      await writeContractAndTransactionToOutputs(V_ETH, await getRandomAddress(), EMPTY_BYTES, "Create Mock V_ETH");
    }

    if (await findDependency(V_USD) === "") {
      await writeContractAndTransactionToOutputs(V_USD, await getRandomAddress(), EMPTY_BYTES, "Create Mock V_USD");
    }

    if (await findDependency(ETH_CHAINLINK_ORACLE) === "") {
      await writeContractAndTransactionToOutputs(ETH_CHAINLINK_ORACLE, await getRandomAddress(), EMPTY_BYTES, "Create Mock ETH_CHAINLINK_ORACLE");
    }

    if (await findDependency(USDC_CHAINLINK_ORACLE) === "") {
      await writeContractAndTransactionToOutputs(USDC_CHAINLINK_ORACLE, await getRandomAddress(), EMPTY_BYTES, "Create Mock USDC_CHAINLINK_ORACLE");
    }

    if (await findDependency(PERPV2_ACCOUNT_BALANCE) === "") {
      await writeContractAndTransactionToOutputs(PERPV2_ACCOUNT_BALANCE, await getRandomAddress(), EMPTY_BYTES, "Create Mock PERPV2_ACCOUNT_BALANCE");
    }

    if (await findDependency(PERPV2_LEVERAGE_MODULE) === "") {
      await writeContractAndTransactionToOutputs(PERPV2_LEVERAGE_MODULE, await getRandomAddress(), EMPTY_BYTES, "Create Mock PERPV2_LEVERAGE_MODULE");
    }
  }

  async function deployPerpLeverageStrategyExtension(): Promise<void> {
    const checkLeverageStrategyExtensionAddress = await getContractAddress(CONTRACT_NAMES.LEVERAGE_EXTENSION);
    if (checkLeverageStrategyExtensionAddress == "") {
      const manager = await getContractAddress(CONTRACT_NAMES.BASE_MANAGER);

      const contractSettings: PerpV2ContractSettings = {
        setToken: await findDependency(TEST_PERP_TOKEN),
        perpV2LeverageModule: await findDependency(PERPV2_LEVERAGE_MODULE),
        perpV2AccountBalance: await findDependency(PERPV2_ACCOUNT_BALANCE),
        basePriceOracle: await findDependency(ETH_CHAINLINK_ORACLE),
        quotePriceOracle: await findDependency(USDC_CHAINLINK_ORACLE),
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