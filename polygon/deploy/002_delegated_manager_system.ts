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

import { initializeManagerCore } from "@utils/deploys/deployUtils";

import { DEPENDENCY } from "../deployments/utils/dependencies";
import { CONTRACT_NAMES } from "../deployments/constants/002_delegated_manager_system";

const {
  SET_TOKEN_CREATOR,
  ISSUANCE_MODULE,
  STREAMING_FEE_MODULE,
  TRADE_MODULE,
} = DEPENDENCY;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (bre: HRE) {
  const {
    deploy,
    deployer,
  } = await prepareDeployment(bre);

  await deployManagerCore();
  const managerCoreAddress = await getContractAddress(CONTRACT_NAMES.MANAGER_CORE);

  const setTokenCreatorAddress = await findDependency(SET_TOKEN_CREATOR);
  await deployDelegatedManagerFactory();

  await initializeManagerCore(CONTRACT_NAMES.DELEGATED_MANAGER_FACTORY, bre);

  const issuanceModuleAddress = await findDependency(ISSUANCE_MODULE);
  await deployIssuanceExtension();

  const streamingFeeModuleAddress = await findDependency(STREAMING_FEE_MODULE);
  await deployStreamingFeeSplitExtension();

  const tradeModuleAddress = await findDependency(TRADE_MODULE);
  await deployTradeExtension();

  //
  // Helper Functions
  //

  async function deployManagerCore(): Promise<void> {
    const checkManagerCoreAddress = await getContractAddress(CONTRACT_NAMES.MANAGER_CORE);
    if (checkManagerCoreAddress === "") {
      const managerCoreDeploy = await deploy(
        CONTRACT_NAMES.MANAGER_CORE,
        { from: deployer, log: true }
      );
      managerCoreDeploy.receipt && await saveContractDeployment({
        name: CONTRACT_NAMES.MANAGER_CORE,
        contractAddress: managerCoreDeploy.address,
        id: managerCoreDeploy.receipt.transactionHash,
        description: `Deployed ${CONTRACT_NAMES.MANAGER_CORE}`
      });
    }
  }

  async function deployDelegatedManagerFactory(): Promise<void> {
    const checkDelegatedManagerFactoryAddress = await getContractAddress(CONTRACT_NAMES.DELEGATED_MANAGER_FACTORY);
    if (checkDelegatedManagerFactoryAddress === "") {
      const constructorArgs = [managerCoreAddress, setTokenCreatorAddress];
      const delegatedManagerFactoryDeploy = await deploy(
        CONTRACT_NAMES.DELEGATED_MANAGER_FACTORY,
        { from: deployer, args: constructorArgs, log: true }
      );
      delegatedManagerFactoryDeploy.receipt && await saveContractDeployment({
        name: CONTRACT_NAMES.DELEGATED_MANAGER_FACTORY,
        contractAddress: delegatedManagerFactoryDeploy.address,
        id: delegatedManagerFactoryDeploy.receipt.transactionHash,
        description: `Deployed ${CONTRACT_NAMES.DELEGATED_MANAGER_FACTORY}`,
        constructorArgs,
      });
    }
  }

  async function deployIssuanceExtension(): Promise<void> {
    const checkIssuanceExtensionAddress = await getContractAddress(CONTRACT_NAMES.ISSUANCE_EXTENSION);
    if (checkIssuanceExtensionAddress === "") {
      const constructorArgs = [managerCoreAddress, issuanceModuleAddress];
      const issuanceExtensionDeploy = await deploy(
        CONTRACT_NAMES.ISSUANCE_EXTENSION,
        { from: deployer, args: constructorArgs, log: true }
      );
      issuanceExtensionDeploy.receipt && await saveContractDeployment({
        name: CONTRACT_NAMES.ISSUANCE_EXTENSION,
        contractAddress: issuanceExtensionDeploy.address,
        id: issuanceExtensionDeploy.receipt.transactionHash,
        description: `Deployed ${CONTRACT_NAMES.ISSUANCE_EXTENSION}`,
        constructorArgs,
      });
    }
  }

  async function deployStreamingFeeSplitExtension(): Promise<void> {
    const checkStreamingFeeSplitExtensionAddress = await getContractAddress(CONTRACT_NAMES.STREAMING_FEE_SPLIT_EXTENSION);
    if (checkStreamingFeeSplitExtensionAddress === "") {
      const constructorArgs = [managerCoreAddress, streamingFeeModuleAddress];
      const streamingFeeSplitExtensionDeploy = await deploy(
        CONTRACT_NAMES.STREAMING_FEE_SPLIT_EXTENSION,
        { from: deployer, args: constructorArgs, log: true }
      );
      streamingFeeSplitExtensionDeploy.receipt && await saveContractDeployment({
        name: CONTRACT_NAMES.STREAMING_FEE_SPLIT_EXTENSION,
        contractAddress: streamingFeeSplitExtensionDeploy.address,
        id: streamingFeeSplitExtensionDeploy.receipt.transactionHash,
        description: `Deployed ${CONTRACT_NAMES.STREAMING_FEE_SPLIT_EXTENSION}`,
        constructorArgs,
      });
    }
  }

  async function deployTradeExtension(): Promise<void> {
    const checkTradeExtensionAddress = await getContractAddress(CONTRACT_NAMES.TRADE_EXTENSION);
    if (checkTradeExtensionAddress === "") {
      const constructorArgs = [managerCoreAddress, tradeModuleAddress];
      const tradeExtensionDeploy = await deploy(
        CONTRACT_NAMES.TRADE_EXTENSION,
        { from: deployer, args: constructorArgs, log: true }
      );
      tradeExtensionDeploy.receipt && await saveContractDeployment({
        name: CONTRACT_NAMES.TRADE_EXTENSION,
        contractAddress: tradeExtensionDeploy.address,
        id: tradeExtensionDeploy.receipt.transactionHash,
        description: `Deployed ${CONTRACT_NAMES.TRADE_EXTENSION}`,
        constructorArgs,
      });
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;