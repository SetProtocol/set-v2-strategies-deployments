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
  trackFinishedStage
} from "@utils/index";

import { DEPENDENCY } from "../deployments/utils/dependencies";
import { CONTRACT_NAMES } from "../deployments/constants/002_exchangeIssuanceZeroEx";

const {
  WETH,
  CONTROLLER,
  ZERO_EX_EXCHANGE
} = DEPENDENCY;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {
  const { deploy, deployer } = await prepareDeployment(hre);

  const contractName = CONTRACT_NAMES.EXCHANGE_ISSUANCE_ZEROEX;

  const wethAddress = await findDependency(WETH);
  const controllerAddress = await findDependency(CONTROLLER);
  const zeroExExchangeAddress = await findDependency(ZERO_EX_EXCHANGE);
  const checkExchangeIssuanceAddress = await getContractAddress(contractName);

  if (checkExchangeIssuanceAddress === "") {
    const constructorArgs = [wethAddress, controllerAddress, zeroExExchangeAddress];
    const exchangeIssuanceDeploy = await deploy(contractName, {
      from: deployer,
      args: constructorArgs,
      log: true,
    });
    exchangeIssuanceDeploy.receipt &&
      (await saveContractDeployment({
        name: contractName,
        contractAddress: exchangeIssuanceDeploy.address,
        id: exchangeIssuanceDeploy.receipt.transactionHash,
        description: `Deployed ${contractName}`,
        constructorArgs,
      }));
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;