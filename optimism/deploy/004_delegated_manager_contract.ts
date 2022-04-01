import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  prepareDeployment,
  getContractAddress,
  getCurrentStage,
  saveContractDeployment,
  stageAlreadyFinished,
  trackFinishedStage
} from "@utils/index";

import { getRandomAddress } from "@utils/accountUtils";
import { CONTRACT_NAMES } from "../deployments/constants/004_delegated_manager_contract";

const CURRENT_STAGE = getCurrentStage(__filename);

// The DelegatedManager contract is factory deployed (usually in tandem with a SetToken).
// This script deploys (and verifies) a non-functional manager to the chain to enabled automated
// Etherscan verification for any additional instances created by the DelegatedManagerFactory
const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {
  const { deploy, deployer } = await prepareDeployment(hre);

  const contractName = CONTRACT_NAMES.DELEGATED_MANAGER;

  const constructorArgs = [
    await getRandomAddress(), // _setToken
    await getRandomAddress(), // _factory
    await getRandomAddress(), // _methodologist
    [],                       // _extensions
    [],                       // _operators
    [],                       // _allowedAssets
    false                     // _useAssetAllowlist
  ];

  if (await getContractAddress(contractName) === "") {

    const delegatedManagerDeploy = await deploy(contractName, {
      from: deployer,
      args: constructorArgs,
      log: true,
    });

    delegatedManagerDeploy.receipt &&
      (await saveContractDeployment({
        name: contractName,
        contractAddress: delegatedManagerDeploy.address,
        id: delegatedManagerDeploy.receipt!.transactionHash,
        description: `Deployed ${contractName}`,
        constructorArgs,
      }));
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;
