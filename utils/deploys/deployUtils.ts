import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  findDependency,
  getLastDeploymentStage,
  writeStateToOutputs,
  writeTransactionToOutputs,
  ensureOutputsFile,
} from "../outputHelper";

import {
  getAccounts,
  getContractAddress,
  getNetworkConstant,
  InstanceGetter,
  removeNetwork,
  saveContractDeployment,
  saveDeferredTransactionData,
  writeContractAndTransactionToOutputs
} from "@utils/index";

import { Address } from "hardhat-deploy/dist/types";
import { BigNumber } from "ethers";
import { ether, ProtocolUtils } from "@utils/common";
import { JsonRpcProvider } from "@ethersproject/providers";

import { DEPENDENCY } from "../../ethereum/deployments/utils/dependencies";

const {
  CONTROLLER
} = DEPENDENCY;

/* eslint-disable */
export function trackFinishedStage(
  currentStage: number,
  func: (env: HardhatRuntimeEnvironment) => Promise<void>
): (env: HardhatRuntimeEnvironment) => Promise<void> {
  return async (env: HardhatRuntimeEnvironment) => {
    await func(env);

    await writeStateToOutputs("last_deployment_stage", currentStage + 1);
  };
}
/* eslint-enable */

export function stageAlreadyFinished(currentStage: number): () => Promise <boolean> {
  return async () => {
    const lastStage = await getLastDeploymentStage();

    return currentStage < lastStage;
  };
}

// Runs at the top of every deploy script, clearing contract addresses when network is development
export async function prepareDeployment(hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, rawTx } = deployments;
  const { deployer } = await getNamedAccounts();

  const networkConstant = await getNetworkConstant();
  try {
    if (networkConstant === "development") {
      console.log(`\n*** Clearing all addresses for ${networkConstant} ***\n`);
      await removeNetwork(networkConstant);
    }
  } catch (error) {
    console.log("*** No addresses to wipe *** ");
  }

  await ensureOutputsFile();

  return {
    deploy,
    rawTx,
    deployer,
    networkConstant,
  };
}

export async function deployBaseManager(
  hre: HardhatRuntimeEnvironment,
  managerName: string,
  tokenName: string,
  operator: Address,
  methodologist: Address,
) {
  const {
    deploy,
    deployer,
  } = await prepareDeployment(hre);

  const checkBaseManagerAddress = await getContractAddress(managerName);
  if (checkBaseManagerAddress === "") {
    const constructorArgs = [
      await findDependency(tokenName),
      operator,
      methodologist,
    ];

    const baseManagerDeploy = await deploy("BaseManager", {
      from: deployer,
      args: constructorArgs,
      log: true,
    });

    baseManagerDeploy.receipt && await saveContractDeployment({
      name: managerName,
      contractAddress: baseManagerDeploy.address,
      id: baseManagerDeploy.receipt.transactionHash,
      description: `Deployed ${managerName}`,
      constructorArgs,
    });
  }
}

export async function deployGovernanceExtension(
  hre: HardhatRuntimeEnvironment,
  govExtensionName: string,
  managerName: string,
): Promise<void> {
  const {
    deploy,
    deployer,
  } = await prepareDeployment(hre);

  const checkGovExtensionAddress = await getContractAddress(govExtensionName);
  if (checkGovExtensionAddress === "") {
    const manager = await getContractAddress(managerName);
    const governanceModule = await findDependency("GOVERNANCE_MODULE");

    const constructorArgs = [
      manager,
      governanceModule,
    ];

    const governanceExtensionDeploy = await deploy("GovernanceExtension", {
      from: deployer,
      args: constructorArgs,
      log: true,
    });

    governanceExtensionDeploy.receipt && await saveContractDeployment({
      name: govExtensionName,
      contractAddress: governanceExtensionDeploy.address,
      id: governanceExtensionDeploy.receipt.transactionHash,
      description: `Deployed ${govExtensionName}`,
      constructorArgs,
    });
  }
}

// Alias
export const deployGovernanceAdapter = deployGovernanceExtension;

export async function deployStreamingFeeExtension(
  hre: HardhatRuntimeEnvironment,
  feeExtensionName: string,
  managerName: string,
  feeSplit: BigNumber,
  operatorFeeRecipient: Address
): Promise<void> {
  const {
    deploy,
    deployer,
  } = await prepareDeployment(hre);

  const checkFeeExtensionAddress = await getContractAddress(feeExtensionName);
  if (checkFeeExtensionAddress === "") {
    const manager = await getContractAddress(managerName);
    const streamingFeeModule = await findDependency("STREAMING_FEE_MODULE");

    const constructorArgs = [
      manager,
      streamingFeeModule,
      feeSplit,
      operatorFeeRecipient,
    ];

    const feeSplitExtensionDeploy = await deploy("StreamingFeeSplitExtension", {
      from: deployer,
      args: constructorArgs,
      log: true,
    });

    feeSplitExtensionDeploy.receipt && await saveContractDeployment({
      name: feeExtensionName,
      contractAddress: feeSplitExtensionDeploy.address,
      id: feeSplitExtensionDeploy.receipt.transactionHash,
      description: `Deployed ${feeExtensionName}`,
      constructorArgs,
    });
  }
}

export async function deployFeeExtension(
  hre: HardhatRuntimeEnvironment,
  feeExtensionName: string,
  managerName: string,
  feeSplit: BigNumber,
  operatorFeeRecipient: Address,
  streamingFeeModule: Address,
  debtIssuanceModule: Address,

): Promise<void> {
  const {
    deploy,
    deployer,
  } = await prepareDeployment(hre);

  const checkFeeExtensionAddress = await getContractAddress(feeExtensionName);
  if (checkFeeExtensionAddress === "") {

    const manager = await getContractAddress(managerName);

    const constructorArgs = [
      manager,
      streamingFeeModule,
      debtIssuanceModule,
      feeSplit,
      operatorFeeRecipient,
    ];

    const feeSplitAdapterDeploy = await deploy("FeeSplitExtension", {
      from: deployer,
      args: constructorArgs,
      log: true,
    });

    feeSplitAdapterDeploy.receipt && await saveContractDeployment({
      name: feeExtensionName,
      contractAddress: feeSplitAdapterDeploy.address,
      id: feeSplitAdapterDeploy.receipt.transactionHash,
      description: `Deployed ${feeExtensionName}`,
      constructorArgs,
    });
  }
}

export async function deployGIMExtension(
  hre: HardhatRuntimeEnvironment,
  gimExtensionName: string,
  managerName: string,
): Promise<void> {
  const {
    deploy,
    deployer,
  } = await prepareDeployment(hre);

  const checkGIMExtensionAddress = await getContractAddress(gimExtensionName);
  if (checkGIMExtensionAddress === "") {
    const manager = await getContractAddress(managerName);
    const generalIndexModule = await findDependency("GENERAL_INDEX_MODULE");

    const constructorArgs = [
      manager,
      generalIndexModule,
    ];

    const gimExtensionDeploy = await deploy("GIMExtension", {
      from: deployer,
      args: constructorArgs,
      log: true,
    });

    gimExtensionDeploy.receipt && await saveContractDeployment({
      name: gimExtensionName,
      contractAddress: gimExtensionDeploy.address,
      id: gimExtensionDeploy.receipt.transactionHash,
      description: `Deployed ${gimExtensionName}`,
      constructorArgs,
    });
  }
}

export async function addExtension(
  hre: HardhatRuntimeEnvironment,
  managerName: string,
  extensionName: string
): Promise<void> {
  const {
    rawTx,
    deployer,
  } = await prepareDeployment(hre);

  const [owner] = await getAccounts();
  const instanceGetter: InstanceGetter = new InstanceGetter(owner.wallet);

  const baseManagerAddress = await getContractAddress(managerName);
  const baseManagerInstance = await instanceGetter.getBaseManager(baseManagerAddress);

  const extensionAddress = await getContractAddress(extensionName);
  if (!await baseManagerInstance.isAdapter(extensionAddress)) {
    const addExtensionData = baseManagerInstance.interface.encodeFunctionData("addAdapter", [extensionAddress]);
    const description = `Add ${extensionName} on ${managerName}`;

    const operator = await baseManagerInstance.operator();

    if (process.env.TESTING_PRODUCTION || operator != deployer) {
      await saveDeferredTransactionData({
        data: addExtensionData,
        description,
        contractName: managerName,
      });
    } else {
      const addExtensionTransaction: any = await rawTx({
        from: deployer,
        to: baseManagerInstance.address,
        data: addExtensionData,
        log: true,
      });
      await writeTransactionToOutputs(addExtensionTransaction.transactionHash, description);
    }
  }
}

export async function setOperator(
  hre: HardhatRuntimeEnvironment,
  managerName: string,
  newOperator: Address,
): Promise<void> {
  const {
    rawTx,
    deployer,
  } = await prepareDeployment(hre);

  const [owner] = await getAccounts();
  const instanceGetter: InstanceGetter = new InstanceGetter(owner.wallet);

  const baseManagerAddress = await getContractAddress(managerName);
  const baseManagerInstance = await instanceGetter.getBaseManager(baseManagerAddress);
  const currentOperator = await baseManagerInstance.operator();

  if (currentOperator != newOperator) {
    const setOperatorData = baseManagerInstance.interface.encodeFunctionData("setOperator", [newOperator]);
    const description = `${newOperator} set as operator on ${managerName}`;

    if (currentOperator != deployer) {
      await saveDeferredTransactionData({
        data: setOperatorData,
        description,
        contractName: managerName,
      });
    } else {
      const setOperatorTransaction: any = await rawTx({
        from: deployer,
        to: baseManagerInstance.address,
        data: setOperatorData,
        log: true,
      });
      await writeTransactionToOutputs(setOperatorTransaction.transactionHash, description);
    }
  }
}

export async function addApprovedCaller(
  hre: HardhatRuntimeEnvironment,
  extensionName: string,
  callers: Address[],
  statuses: boolean[]
): Promise<void> {
  const {
    rawTx,
    deployer,
  } = await prepareDeployment(hre);

  const [owner] = await getAccounts();
  const instanceGetter: InstanceGetter = new InstanceGetter(owner.wallet);

  const extensionAddress = await getContractAddress(extensionName);
  const extensionInstance = await instanceGetter.getExtension(extensionAddress);

  const updateCallerData = extensionInstance.interface.encodeFunctionData(
    "updateCallerStatus",
    [callers, statuses]
  );
  const description = `${extensionName} caller statuses updated.`;

  const managerAddress = await extensionInstance.manager();
  const baseManagerInstance = await instanceGetter.getBaseManager(managerAddress);
  const operator = await baseManagerInstance.operator();

  if (operator != deployer) {
    await saveDeferredTransactionData({
      data: updateCallerData,
      description,
      contractName: extensionName,
    });
  } else {
    const addCallerTransaction: any = await rawTx({
      from: deployer,
      to: extensionInstance.address,
      data: updateCallerData,
      log: true,
    });
    await writeTransactionToOutputs(addCallerTransaction.transactionHash, description);
  }
}

export async function initializeGeneralIndexModule(tokenName: string): Promise<void> {
  const [owner] = await getAccounts();
  const instanceGetter = new InstanceGetter(owner.wallet);

  const gimAddr = await findDependency("GENERAL_INDEX_MODULE");
  const tokenAddr = await findDependency(tokenName);

  const gim = await instanceGetter.getGeneralIndexModule(gimAddr);

  const tx = await gim.initialize(
    tokenAddr,
    { gasLimit: 1000000 }
  );
  await writeTransactionToOutputs(tx.hash, `Initialize GeneralIndexModule for ${tokenName}`);
}

export async function initializeDebtIssuanceModule(
  tokenName: string,
  issueFee: BigNumber,
  redeemFee: BigNumber,
  feeRecipient: Address,
  managerIssueHook: Address
): Promise<void> {
  const [owner] = await getAccounts();
  const instanceGetter = new InstanceGetter(owner.wallet);

  const dimAddr = await findDependency("DEBT_ISSUANCE_MODULE");
  const tokenAddr = await findDependency(tokenName);

  const dim = await instanceGetter.getDebtIssuanceModule(dimAddr);

  // use 5% as the maximum reasonable issuance/redemption fee
  const tx = await dim.initialize(tokenAddr, ether(0.05), issueFee, redeemFee, feeRecipient, managerIssueHook);
  await writeTransactionToOutputs(tx.hash, `Initialize DebtIssuanceModule for ${tokenName}`);
}

export async function initializeStreamingFeeModule(
  tokenName: string,
  feeRecipient: Address,
  fee: BigNumber
): Promise<void> {
  const [owner] = await getAccounts();
  const instanceGetter = new InstanceGetter(owner.wallet);

  const streamingFeeModuleAddr = await findDependency("STREAMING_FEE_MODULE");
  const tokenAddr = await findDependency(tokenName);

  const streamingFeeModule = await instanceGetter.getStreamingFeeModule(streamingFeeModuleAddr);

  // use 40% as the max reasonable streaming fee
  const feeSettings = {
    feeRecipient: feeRecipient,
    maxStreamingFeePercentage: ether(0.40),
    streamingFeePercentage: fee,
    lastStreamingFeeTimestamp: 0,
  };

  const tx = await streamingFeeModule.initialize(tokenAddr, feeSettings);
  await writeTransactionToOutputs(tx.hash, `Initialize StreamingFeeModule for ${tokenName}`);
}

export async function deploySetToken(
  _name: string,
  _symbol: string,
  _manager: Address,
  _components: Address[],
  _units: BigNumber[],
  _modules: Address[]
): Promise<void> {

  const checkGMIAddress = await getContractAddress(_symbol);

  if (checkGMIAddress === "") {
    const [owner] = await getAccounts();
    const instanceGetter = new InstanceGetter(owner.wallet);

    const setTokenCreatorAddr = await findDependency("SET_TOKEN_CREATOR");
    const setTokenCreator = await instanceGetter.getSetTokenCreator(setTokenCreatorAddr);

    const tx = await setTokenCreator.create(
      _components,
      _units,
      _modules,
      _manager,
      _name,
      _symbol
    );

    await tx.wait();

    const tokenAddr = await new ProtocolUtils(owner.wallet.provider as JsonRpcProvider)
      .getCreatedSetTokenAddress(tx.hash);

    await writeContractAndTransactionToOutputs(_symbol, tokenAddr, tx.hash, "Deployed GMI");
  }
}

export async function updateSetManager(
  hre: HardhatRuntimeEnvironment,
  setName: string,
  baseManagerName: string
): Promise<void> {
  const {
    rawTx,
    deployer,
  } = await prepareDeployment(hre);

  const [owner] = await getAccounts();
  const instanceGetter: InstanceGetter = new InstanceGetter(owner.wallet);

  const setTokenAddress = await findDependency(setName);
  const setTokenInstance = await instanceGetter.getSetToken(setTokenAddress);

  const setManagerAddress = await setTokenInstance.manager();
  const newManagerAddress = await getContractAddress(baseManagerName);

  const setManagerData = setTokenInstance.interface.encodeFunctionData("setManager", [
    newManagerAddress,
  ]);
  const description = `Set ${baseManagerName} contract as ${setName} Manager`;

  if (setManagerAddress != deployer) {
    await saveDeferredTransactionData({
      data: setManagerData,
      description,
      contractName: setName,
    });
  } else {
    const setManagerTransaction: any = await rawTx({
      from: deployer,
      to: setTokenInstance.address,
      data: setManagerData,
      log: true,
    });
    await writeTransactionToOutputs(setManagerTransaction.transactionHash, description);
  }
}

async function getEnvironment(hre: HardhatRuntimeEnvironment) {
  const [owner] = await getAccounts();
  const instanceGetter = new InstanceGetter(owner.wallet);
  const { rawTx } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const networkConstant = await getNetworkConstant();

  return {
    instanceGetter,
    rawTx,
    deployer,
    networkConstant,
  };
}

export async function enableModuleOnSetController(
  moduleName: string,
  hre: HardhatRuntimeEnvironment,
  skipProductionCheck: boolean = false,
): Promise<void> {
  const {
    instanceGetter,
    rawTx,
    deployer,
    networkConstant,
  } = await getEnvironment(hre);

  const moduleAddress = await getContractAddress(moduleName);
  const controllerAddress = await findDependency(CONTROLLER);
  const controllerInstance = await instanceGetter.getController(controllerAddress);

  if (!await controllerInstance.isSystemContract(moduleAddress)) {
    const data = controllerInstance.interface.encodeFunctionData(
      "addModule",
      [moduleAddress]
    );
    const description = `Add ${moduleName} to Controller`;

    if ((networkConstant === "production" || process.env.TESTING_PRODUCTION) && !skipProductionCheck) {
      await saveDeferredTransactionData({
        data,
        description,
        contractName: CONTROLLER,
      });
    } else {
      const addModuleTransaction: any = await rawTx({
        from: deployer,
        to: controllerAddress,
        data,
        log: true,
      });
      await writeTransactionToOutputs(addModuleTransaction.transactionHash, description);
    }
  }
}