import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  prepareDeployment,
  findDependency,
  getContractAddress,
  getCurrentStage,
  saveContractDeployment,
  stageAlreadyFinished,
  trackFinishedStage,
  addExtensionToManagerCore,
} from "@utils/index";

import { DEPENDENCY } from "../deployments/utils/dependencies";
import { CONTRACT_NAMES } from "../deployments/constants/003_batch_trade_extension";

const { TRADE_MODULE } = DEPENDENCY;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (bre: HRE) {
  const {
    deploy,
    deployer,
  } = await prepareDeployment(bre);

  const managerCoreAddress = await getContractAddress(CONTRACT_NAMES.MANAGER_CORE);
  const tradeModuleAddress = await findDependency(TRADE_MODULE);

  await deployBatchTradeExtension();

  await addExtensionToManagerCore(CONTRACT_NAMES.BATCH_TRADE_EXTENSION, bre);

  //
  // Helper Functions
  //

  async function deployBatchTradeExtension(): Promise<void> {
    const checkBatchTradeExtensionAddress = await getContractAddress(CONTRACT_NAMES.BATCH_TRADE_EXTENSION);
    if (checkBatchTradeExtensionAddress === "") {
      const constructorArgs = [managerCoreAddress, tradeModuleAddress, ["ZeroExApiAdapterV5"]];
      const batchTradeExtensionDeploy = await deploy(
        CONTRACT_NAMES.BATCH_TRADE_EXTENSION,
        { from: deployer, args: constructorArgs, log: true }
      );
      batchTradeExtensionDeploy.receipt && await saveContractDeployment({
        name: CONTRACT_NAMES.BATCH_TRADE_EXTENSION,
        contractAddress: batchTradeExtensionDeploy.address,
        id: batchTradeExtensionDeploy.receipt.transactionHash,
        description: `Deployed ${CONTRACT_NAMES.BATCH_TRADE_EXTENSION}`,
        constructorArgs,
      });
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;