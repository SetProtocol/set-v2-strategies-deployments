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
  writeTransactionToOutputs,
  getAccounts,
} from "@utils/index";

import { Account } from "@utils/types";
import { InstanceGetter } from "@utils/instanceGetter";

import { DEPENDENCY } from "../deployments/utils/dependencies";
import { CONTRACT_NAMES } from "../deployments/constants/001_delegated_manager_system";

const {
  MULTI_SIG_OWNER,
  CONTROLLER,
  SET_TOKEN_CREATOR,
  DEBT_ISSUANCE_MODULE_V2,
  STREAMING_FEE_MODULE,
  TRADE_MODULE,
} = DEPENDENCY;

let owner: Account;
let instanceGetter: InstanceGetter;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (bre: HRE) {
  return;

  const {
    deploy,
    deployer,
    rawTx,
    networkConstant
  } = await prepareDeployment(bre);

  [owner] = await getAccounts();
  instanceGetter = new InstanceGetter(owner.wallet);

  await deployManagerCore();
  const managerCoreAddress = await getContractAddress(CONTRACT_NAMES.MANAGER_CORE);

  const controllerAddress = await findDependency(CONTROLLER);
  const setTokenCreatorAddress = await findDependency(SET_TOKEN_CREATOR);
  await deployDelegatedManagerFactory();
  const delegatedManagerFactoryAddress = await getContractAddress(CONTRACT_NAMES.DELEGATED_MANAGER_FACTORY);

  const issuanceModuleAddress = await findDependency(DEBT_ISSUANCE_MODULE_V2);
  await deployIssuanceExtension();
  const issuanceExtensionAddress = await getContractAddress(CONTRACT_NAMES.ISSUANCE_EXTENSION);

  const streamingFeeModuleAddress = await findDependency(STREAMING_FEE_MODULE);
  await deployStreamingFeeSplitExtension();
  const streamingFeeSplitExtensionAddress = await getContractAddress(CONTRACT_NAMES.STREAMING_FEE_SPLIT_EXTENSION);

  const tradeModuleAddress = await findDependency(TRADE_MODULE);
  await deployTradeExtension();
  const tradeExtensionAddress = await getContractAddress(CONTRACT_NAMES.TRADE_EXTENSION);

  await initializeManagerCore();

  await transferManagerCoreOwnershipToMultisig();

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
      const constructorArgs = [managerCoreAddress, controllerAddress, setTokenCreatorAddress];
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

  async function initializeManagerCore(): Promise<void> {
    const managerCoreInstance = await instanceGetter.getManagerCore(managerCoreAddress);
    if (!await managerCoreInstance.isInitialized()) {
      const initializeData = managerCoreInstance.interface.encodeFunctionData(
        "initialize",
        [[issuanceExtensionAddress, streamingFeeSplitExtensionAddress, tradeExtensionAddress], [delegatedManagerFactoryAddress]]
      );
      const description = "Initialized ManagerCore with DelegatedManagerFactory, IssuanceExtension, StreamingFeeSplitExtension, and TradeExtension";

      const initializeTransaction: any = await rawTx({
        from: deployer,
        to: managerCoreAddress,
        data: initializeData,
        log: true,
      });
      await writeTransactionToOutputs(initializeTransaction.transactionHash, description);
    }
  }

  async function transferManagerCoreOwnershipToMultisig(): Promise<void> {
    if (networkConstant === "production") {
      const multisig = await findDependency(MULTI_SIG_OWNER);
      const managerCoreInstance = await instanceGetter.getManagerCore(managerCoreAddress);

      const managerCoreOwner = await managerCoreInstance.owner();
      if (multisig !== "" && managerCoreOwner === deployer) {
        const transferOwnershipData = managerCoreInstance.interface.encodeFunctionData(
          "transferOwnership",
          [multisig]
        );

        const transferOwnershipTransaction: any = await rawTx({
          from: deployer,
          to: managerCoreAddress,
          data: transferOwnershipData,
          log: true,
        });

        await writeTransactionToOutputs(
          transferOwnershipTransaction.transactionHash,
          "Transfer ManagerCore ownership to Multisig"
        );
      }
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;