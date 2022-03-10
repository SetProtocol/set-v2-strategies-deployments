import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  prepareDeployment,
  findDependency,
  getContractAddress,
  getCurrentStage,
  enableModuleOnSetController,
  saveContractDeployment,
  stageAlreadyFinished,
  trackFinishedStage
} from "@utils/index";

import { DEPENDENCY } from "../deployments/utils/dependencies";
import { CONTRACT_NAMES } from "../deployments/constants/002_issuanceModule";

const { CONTROLLER } = DEPENDENCY;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (bre: HRE) {
  const { deploy, deployer } = await prepareDeployment(bre);

  const controllerAddress = await findDependency(CONTROLLER);

  const contractName = CONTRACT_NAMES.ISSUANCE_MODULE;

  await deployIssuanceModule();

  await enableModuleOnSetController(contractName, bre);

  //
  // Helper Functions
  //

  async function deployIssuanceModule(): Promise<void> {
    const checkIssuanceModuleAddress = await getContractAddress(contractName);
    if (checkIssuanceModuleAddress === "") {
      const constructorArgs = [controllerAddress];
      const issuanceDeploy = await deploy(
        "DebtIssuanceModuleV2",
        { from: deployer, args: constructorArgs, log: true }
      );
      issuanceDeploy.receipt && await saveContractDeployment({
        name: contractName,
        contractAddress: issuanceDeploy.address,
        id: issuanceDeploy.receipt.transactionHash,
        description: `Deployed ${contractName}`,
        constructorArgs,
      });
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;