import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { ethers } from "ethers";

import {
  findDependency,
  saveDeferredTransactionData,
  writeTransactionToOutputs
} from "./outputHelper";

import { Address } from "./types";
import { getAccounts } from "./accountUtils";
import { InstanceGetter } from "./instanceGetter";
import { prepareDeployment } from "./deploys/deployUtils";

const DELEGATED_MANAGER_FACTORY = "DELEGATED_MANAGER_FACTORY";
const ISSUANCE_EXTENSION = "ISSUANCE_EXTENSION";
const TRADE_EXTENSION = "TRADE_EXTENSION";
const FEE_EXTENSION = "FEE_EXTENSION";

export class ManagerMigrator {
  public provider: Web3Provider | JsonRpcProvider;

  private rawTx: any;
  private instanceGetter: InstanceGetter;
  private factoryContractName: string;
  private delegatedManagerAddressPlaceholder: Address;
  private factoryAddress: Address;
  private tradeExtension: Address;
  private issuanceExtension: Address;
  private feeExtension: Address;
  private isDevelopment: boolean;

  constructor(provider: Web3Provider | JsonRpcProvider) {
    this.provider = provider;

    // Dummy address injected into calldata when DelegatedManager deployment is a deferred transaction
    this.delegatedManagerAddressPlaceholder = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  }

  // Initialization for all class variables which require an async request
  async initialize(hre: HRE): Promise<void> {
    const [owner] = await getAccounts();
    const { rawTx, networkConstant } = await prepareDeployment(hre);

    this.rawTx = rawTx;
    this.instanceGetter = new InstanceGetter(owner.wallet);
    this.isDevelopment = networkConstant === "development";
    this.factoryAddress = await findDependency(DELEGATED_MANAGER_FACTORY);

    this.issuanceExtension = await findDependency(ISSUANCE_EXTENSION);
    this.tradeExtension = await findDependency(TRADE_EXTENSION);
    this.feeExtension = await findDependency(FEE_EXTENSION);
  }

  // Impersonates and funds multisig accounts (for unit tests)
  public async impersonateMultisigs(multisigs: Address[]) {
    if (this.isDevelopment) {
      const signer = this.provider.getSigner();
      const accounts = await this.provider.send("eth_accounts", []);

      for (const multisig of multisigs) {
        await this.provider.send("hardhat_impersonateAccount", [multisig]);
        await signer.sendTransaction({
          to: multisig,
          from: accounts[0],
          value: ethers.utils.parseUnits("100", "ether").toHexString()
        });
      }
    }
  }

  // Transfers SetToken managership from BaseManager to `transitionalManager` - a
  // multisig account which has temporarily taken control of the SetToken
  public async transferSetToTransitionalManager(
    transitionalManager: Address,
    setToken: Address
  ): Promise<void> {
    const legacyManagerContractName = "BaseManager";

    const setTokenInstance = await this.instanceGetter.getSetToken(setToken);
    const manager = await setTokenInstance.manager();
    const symbol = await setTokenInstance.symbol();

    const baseManagerInstance = await this.instanceGetter.getBaseManager(manager);
    const operator = await baseManagerInstance.operator();
    const methodologist = await baseManagerInstance.methodologist();

    const data = baseManagerInstance.interface.encodeFunctionData("setManager", [
      transitionalManager
    ]);

    const description = `${symbol}.BaseManager.setManager(): set ${transitionalManager} as temporary SetToken manager`;

    const from = operator;
    const to = manager;
    const params = { newManager: transitionalManager };

    await this.executeOrLogTransaction(
      from,
      to,
      data,
      params,
      description,
      legacyManagerContractName
    );

    // If development, execute twice because this tx may be mutual upgrade
    if (this.isDevelopment && await this.isMutualUpgrade(setToken)) {
      await this.executeOrLogTransaction(
        methodologist,
        to,
        data,
        params,
        description,
        legacyManagerContractName
      );
    }
  }

  // Transfers SetToken managership from `transitionalManager` to newly deployed and initialized
  // DelegatedManager
  public async transferSetToDelegatedManager(
    transitionalManager: Address,
    delegatedManager: Address,
    setToken: Address
  ): Promise<void> {
    const setTokenInstance = await this.instanceGetter.getSetToken(setToken);
    const symbol = await setTokenInstance.symbol();

    const data = setTokenInstance.interface.encodeFunctionData("setManager", [
      delegatedManager,
    ]);

    const description = `${symbol}.SetToken.setManager(): set ${delegatedManager} as final SetToken manager`;

    const from = transitionalManager;
    const to = setToken;
    const params = { newManager: delegatedManager };

    await this.executeOrLogTransaction(
      from,
      to,
      data,
      params,
      description,
      "BaseManager"
    );
  }

  // Creates a DelegatedManager. Transaction will be sent from the `transitionalManager` - a
  // multisig account which has temporarily taken control of the SetToken
  public async createDelegatedManager(
    transitionalManager: Address,
    setToken: Address,
    owner: Address,
    methodologist: Address,
    operators: Address[]
  ): Promise<void> {
    const setTokenInstance = await this.instanceGetter.getSetToken(setToken);
    const factoryInstance = await this.instanceGetter.getDelegatedManagerFactory(this.factoryAddress);

    const symbol = await setTokenInstance.symbol();
    const assets = await setTokenInstance.getComponents();

    const extensions = [
      this.issuanceExtension,
      this.tradeExtension,
      this.feeExtension
    ];

    // Calldata
    const data = factoryInstance.interface.encodeFunctionData("createManager", [
      setToken,
      owner,
      methodologist,
      operators,
      assets,
      extensions
    ]);

    // Logging info
    const params = {
      setToken,
      owner,
      methodologist,
      operators,
      assets,
      extensions
    };

    const description = `${symbol}.DelegatedManagerFactory.createManager(): create new DelegatedManager`;

    const from = transitionalManager;
    const to = this.factoryAddress;

    await this.executeOrLogTransaction(
      from,
      to,
      data,
      params,
      description,
      DELEGATED_MANAGER_FACTORY
    );
  }

  // Initializes DelegatedManager. Transaction will be sent from the `transitionalManager` - a
  // multisig account which has temporarily taken control of the SetToken
  public async initializeManager(
    transitionalManager: Address,
    legacyFeeExtension: Address,
    setToken: Address,
  ) {
    const setTokenInstance = await this
      .instanceGetter
      .getSetToken(setToken);

    const legacyFeeExtensionInstance = await this
      .instanceGetter
      .getStreamingFeeSplitExtension(legacyFeeExtension);

    const ownerFeeRecipient = await this.getOwnerFeeRecipient(legacyFeeExtensionInstance, transitionalManager);
    const ownerFeeSplit = await legacyFeeExtensionInstance.operatorFeeSplit();
    const symbol = await setTokenInstance.symbol();

    const delegatedManager = await this.getDelegatedManagerAddress(setToken);
    const bytecode = await this.getExtensionInitializationBytecode(this.tradeExtension, delegatedManager);

    const extensions = [
      this.issuanceExtension,
      this.tradeExtension,
      this.feeExtension
    ];

    const initializeBytecode = [
      bytecode,
      bytecode,
      bytecode
    ];

    // Calldata: fallback on manual encoding method due to tsc error in factory interface
    const iface = new ethers.utils.Interface(["function initialize(address,uint256,address,address[],bytes[])"]);
    const data = iface.encodeFunctionData("initialize", [
      setToken,
      ownerFeeSplit,
      ownerFeeRecipient,
      extensions,
      initializeBytecode
    ]);

    // Logging info
    const params = {
      setToken,
      ownerFeeSplit,
      ownerFeeRecipient,
      extensions,
      initializeBytecode,
    };
    const description = `${symbol}.DelegatedManagerFactory.initialize(): initialize new DelegatedManager`;

    const from = transitionalManager;
    const to = this.factoryAddress;

    await this.executeOrLogTransaction(
      from,
      to,
      data,
      params,
      description,
      DELEGATED_MANAGER_FACTORY
    );
  }

  // In development, returns the deployed DelegatedManager address. In production
  // returns a placeholder address that can be easily replaced in the calldata bytecode.
  public async getDelegatedManagerAddress(setToken: Address): Promise<Address> {
    if (this.isDevelopment) {
      const factoryInstance = await this
        .instanceGetter
        .getDelegatedManagerFactory(this.factoryAddress);

      const initializeState = await factoryInstance.initializeState(setToken);
      return initializeState.manager;
    }

    return this.delegatedManagerAddressPlaceholder;
  }

  // Not all managers expose an `operatorFeeRecipient`. We assume transitionalManager is the `operator`
  // of the BaseManager.
  private async getOwnerFeeRecipient(feeExtensionInstance: any, transitionalManager: Address) {
    try {
      return await feeExtensionInstance.operatorFeeRecipient();
    } catch (e) {
      return transitionalManager;
    }
  }

  // Not all managers have setManager gated by mutualUpgrade
  private async isMutualUpgrade(setToken: Address): Promise<boolean> {
    const bed = await findDependency("BED");
    const gmi = await findDependency("BMI");
    const data = await findDependency("DATA");

    switch (setToken) {
      case bed: return false;
      case gmi: return true;
      case data: return true;
      default: return true;
    }
  }

  // All default extension init bytecodes have the same signature
  private async getExtensionInitializationBytecode(
    extension: Address,
    delegatedManager: Address
  ): Promise<string> {
    const extensionInstance = await this.instanceGetter.getTradeExtension(extension);
    return extensionInstance.interface.encodeFunctionData("initializeExtension", [ delegatedManager ]);
  }

  // Executes rawTx if context is development (so unit tests can validate end state)
  // Logs deferred transactions with params otherwise so we can create execution docs easily
  private async executeOrLogTransaction(
    from: Address,
    to: Address,
    data: string,
    params: any,
    description: string,
    contractName: string,
  ): Promise<void> {

    if (this.isDevelopment) {
      const signer = this.provider.getSigner(from);
      const tx = await signer.sendTransaction({to, data});
      const receipt = await tx.wait();

      return await writeTransactionToOutputs(
        receipt.transactionHash,
        description
      );
    }

    await saveDeferredTransactionData({
      data,
      to,
      from,
      params,
      description,
      contractName
    });
  }
}