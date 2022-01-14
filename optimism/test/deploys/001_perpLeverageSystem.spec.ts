import "module-alias/register";
import { deployments } from "hardhat";

import { Account } from "@utils/types";
import {
  BaseManager,
  BaseManager__factory,
  PerpV2LeverageStrategyExtension,
  PerpV2LeverageStrategyExtension__factory,
} from "@set/typechain/index";

import { BigNumber } from "@ethersproject/bignumber";
import {
  addSnapshotBeforeRestoreAfterEach,
  ether,
  getAccounts,
  getWaffleExpect,
} from "@utils/index";
import {
  findDependency,
  getContractAddress,
} from "@utils/deploys";
import {
  ONE_DAY_IN_SECONDS
} from "@utils/constants";


const expect = getWaffleExpect();

describe("PerpLeverageSystem", () => {
  let deployer: Account;

  let baseManagerInstance: BaseManager;
  let perpV2LevExtensionInstance: PerpV2LeverageStrategyExtension;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const deployedBaseManagerContract = await getContractAddress("BaseManager");
    baseManagerInstance = new BaseManager__factory(deployer.wallet).attach(deployedBaseManagerContract);

    const deployedFlexibleLeverageStrategyAdapterContract = await getContractAddress("PerpV2LeverageStrategyExtension");
    perpV2LevExtensionInstance = new
    PerpV2LeverageStrategyExtension__factory(deployer.wallet).attach(deployedFlexibleLeverageStrategyAdapterContract);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("BaseManager", async () => {
    it("should have the correct SetToken address", async () => {
      const setToken = await baseManagerInstance.setToken();
      expect(setToken).to.eq(await findDependency("TEST_PERP_TOKEN"));
    });

    it("should have the correct operator address", async () => {
      const operator = await baseManagerInstance.operator();
      expect(operator).to.eq(deployer.address);
    });

    it("should have the correct methodologist address", async () => {
      const methodologist = await baseManagerInstance.methodologist();
      expect(methodologist).to.eq(deployer.address);
    });

    it("should have the correct adapters", async () => {
      const adapters = await baseManagerInstance.getAdapters();
      expect(adapters[0]).to.eq(perpV2LevExtensionInstance.address);
    });
  });

  describe("PerpV2LeverageStrategyExtension", async () => {
    it("should set the manager", async () => {
      const manager = await perpV2LevExtensionInstance.manager();

      expect(manager).to.eq(baseManagerInstance.address);
    });

    it("should set the contract addresses", async () => {
      const strategy = await perpV2LevExtensionInstance.getStrategy();

      expect(strategy.setToken).to.eq(await findDependency("TEST_PERP_TOKEN"));
      expect(strategy.perpV2LeverageModule).to.eq(await findDependency("PERPV2_LEVERAGE_MODULE"));
      expect(strategy.perpV2AccountBalance).to.eq(await findDependency("PERPV2_ACCOUNT_BALANCE"));
      expect(strategy.virtualBaseAddress).to.eq(await findDependency("V_ETH"));
      expect(strategy.virtualQuoteAddress).to.eq(await findDependency("V_USD"));
      expect(strategy.basePriceOracle).to.eq(await findDependency("ETH_ORACLE_PROXY"));
      expect(strategy.quotePriceOracle).to.eq(await findDependency("USDC_ORACLE_PROXY"));
    });

    it("should set the correct methodology parameters", async () => {
      const methodology = await perpV2LevExtensionInstance.getMethodology();

      expect(methodology.targetLeverageRatio).to.eq(ether(2));
      expect(methodology.minLeverageRatio).to.eq(ether(1.7));
      expect(methodology.maxLeverageRatio).to.eq(ether(2.3));
      expect(methodology.recenteringSpeed).to.eq(ether(0.1));
      expect(methodology.rebalanceInterval).to.eq(ONE_DAY_IN_SECONDS);
    });

    it("should set the correct execution parameters", async () => {
      const execution = await perpV2LevExtensionInstance.getExecution();

      expect(execution.twapCooldownPeriod).to.eq(BigNumber.from(30));
      expect(execution.slippageTolerance).to.eq(ether(0.02));
    });

    it("should set the correct incentive parameters", async () => {
      const incentive = await perpV2LevExtensionInstance.getIncentive();

      expect(incentive.incentivizedTwapCooldownPeriod).to.eq(BigNumber.from(1));
      expect(incentive.incentivizedSlippageTolerance).to.eq(ether(0.05));
      expect(incentive.etherReward).to.eq(ether(1));
      expect(incentive.incentivizedLeverageRatio).to.eq(ether(2.7));
    });

    it("should set the correct exchange settings", async () => {
      const exchange = await perpV2LevExtensionInstance.getExchangeSettings();

      expect(exchange.twapMaxTradeSize).to.eq(ether(10));
      expect(exchange.incentivizedTwapMaxTradeSize).to.eq(ether(20));
    });
  });
});