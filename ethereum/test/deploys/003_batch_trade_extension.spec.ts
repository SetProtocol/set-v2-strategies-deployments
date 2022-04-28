import "module-alias/register";
import { deployments } from "hardhat";

import { Account } from "@utils/types";

import {
  ManagerCore,
  ManagerCore__factory,
  BatchTradeExtension,
  BatchTradeExtension__factory,
} from "@set/typechain/index";

import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
  findDependency,
  getContractAddress,
} from "@utils/index";
import { DEPENDENCY } from "../../deployments/utils/dependencies";
import { CONTRACT_NAMES } from "../../deployments/constants/003_batch_trade_extension";

const {
  TRADE_MODULE
} = DEPENDENCY;

const expect = getWaffleExpect();

describe("Batch Trade Extension", () => {
  let deployer: Account;

  let managerCoreInstance: ManagerCore;
  let batchTradeExtensionInstance: BatchTradeExtension;

  before(async () => {
    [deployer] = await getAccounts();

    await deployments.fixture();

    const deployedManagerCoreContract = await getContractAddress(CONTRACT_NAMES.MANAGER_CORE);
    managerCoreInstance = new ManagerCore__factory(deployer.wallet).attach(deployedManagerCoreContract);

    const deployedBatchTradeExtensionContract = await getContractAddress(CONTRACT_NAMES.BATCH_TRADE_EXTENSION);
    batchTradeExtensionInstance = new BatchTradeExtension__factory(deployer.wallet).attach(deployedBatchTradeExtensionContract);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("BatchTradeExtension", async () => {
    it("should have the correct ManagerCore address", async () => {
      const managerCore = await batchTradeExtensionInstance.managerCore();
      expect(managerCore).to.eq(managerCoreInstance.address);
    });

    it("should have the correct TradeModule address", async () => {
      const tradeModule = await batchTradeExtensionInstance.tradeModule();
      expect(tradeModule).to.eq(await findDependency(TRADE_MODULE));
    });

    it("should be a valid extension on the ManagerCore", async () => {
      const validBatchTradeExtension = await managerCoreInstance.isExtension(batchTradeExtensionInstance.address);
      expect(validBatchTradeExtension).to.eq(true);
    });

    it("should have set the correct integrations length of 1", async () => {
      const integrations = await batchTradeExtensionInstance.getIntegrations();
      expect(integrations.length).to.eq(1);
    });

    it("should have ZeroExApiAdapterV5 as a valid integration", async () => {
      const validZeroExApiAdapterV5 = await batchTradeExtensionInstance.isIntegration("ZeroExApiAdapterV5");
      expect(validZeroExApiAdapterV5).to.eq(true);
    });
  });
});