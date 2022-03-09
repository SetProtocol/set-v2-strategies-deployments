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
import { Address } from "@utils/types";
import { CONTRACT_NAMES } from "../deployments/constants/001_exchangeIssuanceZeroEx";

const {
  WMATIC,
  CONTROLLER,
  ZERO_EX_EXCHANGE
} = DEPENDENCY;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {
  const { deploy, deployer } = await prepareDeployment(hre);

  const wMATICAddress = await findDependency(WMATIC);
  const controllerAddress = await findDependency(CONTROLLER);
  const zeroExExchangeAddress = await findDependency(ZERO_EX_EXCHANGE);

  await deployExchangeIssuanceZeroEx(
    CONTRACT_NAMES.EXCHANGE_ISSUANCE_ZEROEX,
    wMATICAddress,
    controllerAddress,
    zeroExExchangeAddress,
  );

  async function deployExchangeIssuanceZeroEx(
    contractName: string,
    wMATIC: Address,
    controllerAddress: Address,
    zeroExExchangeAddress: Address,
  ): Promise<Address> {
    const checkExchangeIssuanceAddress = await getContractAddress(contractName);

    if (checkExchangeIssuanceAddress === "") {
      const constructorArgs = [wMATIC, controllerAddress, zeroExExchangeAddress];
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
    return await getContractAddress(contractName);
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;