import "module-alias/register";
import { deployments } from "hardhat";

import { Account } from "@utils/types";

import {
  ManagerCore,
  ManagerCore__factory,
  DelegatedManagerFactory,
  DelegatedManagerFactory__factory,
  IssuanceExtension,
  IssuanceExtension__factory,
  StreamingFeeSplitExtension,
  StreamingFeeSplitExtension__factory,
  TradeExtension,
  TradeExtension__factory,
} from "@set/typechain/index";

import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
  findDependency,
  getContractAddress,
} from "@utils/index";
import { DEPENDENCY } from "../../deployments/utils/dependencies";
import { CONTRACT_NAMES } from "../../deployments/constants/003_delegated_manager_system";

const {
  CONTROLLER,
  SET_TOKEN_CREATOR,
  ISSUANCE_MODULE,
  STREAMING_FEE_MODULE,
  TRADE_MODULE,
} = DEPENDENCY;

const expect = getWaffleExpect();

describe("Delegated Manager System", () => {
  let deployer: Account;

  let managerCoreInstance: ManagerCore;
  let delegatedManagerFactoryInstance: DelegatedManagerFactory;
  let issuanceExtensionInstance: IssuanceExtension;
  let streamingFeeSplitExtensionInstance: StreamingFeeSplitExtension;
  let tradeExtensionInstance: TradeExtension;

  before(async () => {
    [deployer] = await getAccounts();

    await deployments.fixture();

    const deployedManagerCoreContract = await getContractAddress(CONTRACT_NAMES.MANAGER_CORE);
    managerCoreInstance = new ManagerCore__factory(deployer.wallet).attach(deployedManagerCoreContract);

    const deployedDelegatedManagerFactoryContract = await getContractAddress(CONTRACT_NAMES.DELEGATED_MANAGER_FACTORY);
    delegatedManagerFactoryInstance = new DelegatedManagerFactory__factory(deployer.wallet).attach(deployedDelegatedManagerFactoryContract);

    const deployedIssuanceExtensionContract = await getContractAddress(CONTRACT_NAMES.ISSUANCE_EXTENSION);
    issuanceExtensionInstance = new IssuanceExtension__factory(deployer.wallet).attach(deployedIssuanceExtensionContract);

    const deployedStreamingFeeSplitExtensionContract = await getContractAddress(CONTRACT_NAMES.STREAMING_FEE_SPLIT_EXTENSION);
    streamingFeeSplitExtensionInstance = new StreamingFeeSplitExtension__factory(deployer.wallet).attach(deployedStreamingFeeSplitExtensionContract);

    const deployedTradeExtensionContract = await getContractAddress(CONTRACT_NAMES.TRADE_EXTENSION);
    tradeExtensionInstance = new TradeExtension__factory(deployer.wallet).attach(deployedTradeExtensionContract);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("ManagerCore", async () => {
    it("should have the correct owner address", async () => {
      const owner = await managerCoreInstance.owner();
      expect(owner).to.eq(deployer.address);
    });

    it("should be initialized", async () => {
      const isInitialized = await managerCoreInstance.isInitialized();
      expect(isInitialized).to.eq(true);
    });

    it("should have one enabled factory", async () => {
      const factories = await managerCoreInstance.getFactories();
      expect(factories.length).to.eq(1);
    });

    it("should have a valid factory", async () => {
      const validFactory = await managerCoreInstance.isFactory(delegatedManagerFactoryInstance.address);
      expect(validFactory).to.eq(true);
    });

    it("should have three enabled extensions", async () => {
      const extensions = await managerCoreInstance.getExtensions();
      expect(extensions.length).to.eq(3);
    });

    it("should have IssuanceExtension as valid extension", async () => {
      const validIssuanceExtension = await managerCoreInstance.isExtension(issuanceExtensionInstance.address);
      expect(validIssuanceExtension).to.eq(true);
    });

    it("should have StreamingFeeSplitExtension as valid extension", async () => {
      const validStreamingFeeSplitExtension = await managerCoreInstance.isExtension(streamingFeeSplitExtensionInstance.address);
      expect(validStreamingFeeSplitExtension).to.eq(true);
    });

    it("should have TradeExtension as valid extension", async () => {
      const validTradeExtension = await managerCoreInstance.isExtension(tradeExtensionInstance.address);
      expect(validTradeExtension).to.eq(true);
    });
  });

  describe("DelegatedManagerFactory", async () => {
    it("should have the correct ManagerCore address", async () => {
      const managerCore = await delegatedManagerFactoryInstance.managerCore();
      expect(managerCore).to.eq(managerCoreInstance.address);
    });

    it("should have the correct Controller address", async () => {
      const controller = await delegatedManagerFactoryInstance.controller();
      expect(controller).to.eq(await findDependency(CONTROLLER));
    });

    it("should have the correct SetTokenFactory address", async () => {
      const setTokenFactory = await delegatedManagerFactoryInstance.setTokenFactory();
      expect(setTokenFactory).to.eq(await findDependency(SET_TOKEN_CREATOR));
    });
  });

  describe("IssuanceExtension", async () => {
    it("should have the correct ManagerCore address", async () => {
      const managerCore = await issuanceExtensionInstance.managerCore();
      expect(managerCore).to.eq(managerCoreInstance.address);
    });

    it("should have the correct IssuanceModule address", async () => {
      const issuanceModule = await issuanceExtensionInstance.issuanceModule();
      expect(issuanceModule).to.eq(await findDependency(ISSUANCE_MODULE));
    });
  });

  describe("StreamingFeeSplitExtension", async () => {
    it("should have the correct ManagerCore address", async () => {
      const managerCore = await streamingFeeSplitExtensionInstance.managerCore();
      expect(managerCore).to.eq(managerCoreInstance.address);
    });

    it("should have the correct StreamingFeeModule address", async () => {
      const streamingFeeModule = await streamingFeeSplitExtensionInstance.streamingFeeModule();
      expect(streamingFeeModule).to.eq(await findDependency(STREAMING_FEE_MODULE));
    });
  });

  describe("TradeExtension", async () => {
    it("should have the correct ManagerCore address", async () => {
      const managerCore = await tradeExtensionInstance.managerCore();
      expect(managerCore).to.eq(managerCoreInstance.address);
    });

    it("should have the correct TradeModule address", async () => {
      const tradeModule = await tradeExtensionInstance.tradeModule();
      expect(tradeModule).to.eq(await findDependency(TRADE_MODULE));
    });
  });
});