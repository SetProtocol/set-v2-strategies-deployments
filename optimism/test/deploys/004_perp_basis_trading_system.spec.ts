import "module-alias/register";
import { deployments } from "hardhat";
import { ONE_HOUR_IN_SECONDS, ZERO, TWO } from "@utils/constants";
import { solidityPack } from "ethers/lib/utils";

import { Account } from "@utils/types";
import {
  BaseManager,
  BaseManager__factory,
  DeltaNeutralBasisTradingStrategyExtension,
  DeltaNeutralBasisTradingStrategyExtension__factory
} from "@set/typechain/index";

import {
  KOVAN_TESTNET_ID
} from "../../deployments/constants/004_perp_basis_trading_system";

import { BigNumber } from "@ethersproject/bignumber";
import {
  addSnapshotBeforeRestoreAfterEach,
  ether,
  getAccounts,
  getWaffleExpect,
  getNetworkId
} from "@utils/index";
import {
  findDependency,
  getContractAddress,
} from "@utils/deploys";

const expect = getWaffleExpect();

describe("PerpV2 Basis Trading System", () => {
  let deployer: Account;

  let baseManagerInstance: BaseManager;
  let strategyExtensionInstance: DeltaNeutralBasisTradingStrategyExtension;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const deployedBaseManagerContract = await getContractAddress("PerpV2BaseManager");
    baseManagerInstance = new BaseManager__factory(deployer.wallet).attach(deployedBaseManagerContract);

    const deployedStrategyAdapterContract = await getContractAddress("DeltaNeutralBasisTradingStrategyExtension");
    strategyExtensionInstance = new
    DeltaNeutralBasisTradingStrategyExtension__factory(deployer.wallet).attach(deployedStrategyAdapterContract);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("PerpV2BaseManager", async () => {
    it("should have the correct SetToken address", async () => {
      const setToken = await baseManagerInstance.setToken();
      expect(setToken).to.eq(await findDependency("TEST_BASIS_TOKEN"));
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
      expect(adapters[0]).to.eq(strategyExtensionInstance.address);
    });
  });

  describe("DeltaNeutralBasisTradingStrategyExtension", async () => {
    it("should set the manager", async () => {
      const manager = await strategyExtensionInstance.manager();

      expect(manager).to.eq(baseManagerInstance.address);
    });

    it("should set the contract addresses", async () => {
      const strategy = await strategyExtensionInstance.getStrategy();

      expect(strategy.setToken).to.eq(await findDependency("TEST_BASIS_TOKEN"));
      expect(strategy.basisTradingModule).to.eq(await findDependency("PERPV2_BASIS_TRADING_MODULE"));
      expect(strategy.tradeModule).to.eq(await findDependency("TRADE_MODULE"));
      expect(strategy.quoter).to.eq((await findDependency("UNISWAP_V3_QUOTER")));
      expect(strategy.perpV2AccountBalance).to.eq(await findDependency("PERPV2_ACCOUNT_BALANCE"));
      expect(strategy.virtualBaseAddress).to.eq(await findDependency("V_ETH"));
      expect(strategy.virtualQuoteAddress).to.eq(await findDependency("V_USD"));
      expect(strategy.baseUSDPriceOracle).to.eq(await findDependency("ETHUSD_PERP_CHAINLINK_ORACLE"));
      expect(strategy.twapInterval).to.eq(ZERO);
      expect(strategy.basePriceDecimalAdjustment).to.eq(10);
      expect(strategy.spotAssetAddress).to.eq((await findDependency("WETH")));
    });

    it("should set the correct methodology parameters", async () => {
      const methodology = await strategyExtensionInstance.getMethodology();

      expect(methodology.targetLeverageRatio).to.eq(ether(-1));
      expect(methodology.minLeverageRatio).to.eq(ether(-0.95));
      expect(methodology.maxLeverageRatio).to.eq(ether(-1.1));
      expect(methodology.recenteringSpeed).to.eq(ether(0.1));
      expect(methodology.rebalanceInterval).to.eq(ONE_HOUR_IN_SECONDS.mul(2));
      expect(methodology.reinvestInterval).to.eq(ONE_HOUR_IN_SECONDS);
      expect(methodology.minReinvestUnits).to.eq(TWO);
    });

    it("should set the correct execution parameters", async () => {
      const execution = await strategyExtensionInstance.getExecution();

      expect(execution.twapCooldownPeriod).to.eq(BigNumber.from(30));
      expect(execution.slippageTolerance).to.eq(ether(0.02));
    });

    it("should set the correct incentive parameters", async () => {
      const incentive = await strategyExtensionInstance.getIncentive();

      expect(incentive.incentivizedTwapCooldownPeriod).to.eq(BigNumber.from(1));
      expect(incentive.incentivizedSlippageTolerance).to.eq(ether(0.05));
      expect(incentive.etherReward).to.eq(ether(1));
      expect(incentive.incentivizedLeverageRatio).to.eq(ether(-1.8));
    });

    it("should set the correct exchange settings", async () => {
      const exchange = await strategyExtensionInstance.getExchangeSettings();

      const networkId = getNetworkId();
      const usdcTokenAddress = (networkId === KOVAN_TESTNET_ID)
        ? await findDependency("PERP_TEST_USDC")
        : await findDependency("USDC");

      const buyExactSpotTradeData = solidityPack(
        ["address", "uint24", "address", "bool"],
        [await findDependency("WETH"), BigNumber.from(3000), usdcTokenAddress, false]
      );
      const sellExactSpotTradeData = solidityPack(
        ["address", "uint24", "address", "bool"],
        [await findDependency("WETH"), BigNumber.from(3000), usdcTokenAddress, true],
      );
      const buySpotQuoteExactInputPath = solidityPack(
        ["address", "uint24", "address"],
        [usdcTokenAddress, BigNumber.from(3000), await findDependency("WETH")]
      );

      expect(exchange.exchangeName).to.eq("UniswapV3ExchangeAdapterV2");
      expect(exchange.buyExactSpotTradeData).to.eq(buyExactSpotTradeData);
      expect(exchange.sellExactSpotTradeData).to.eq(sellExactSpotTradeData);
      expect(exchange.buySpotQuoteExactInputPath).to.eq(buySpotQuoteExactInputPath);
      expect(exchange.twapMaxTradeSize).to.eq(ether(10));
      expect(exchange.incentivizedTwapMaxTradeSize).to.eq(ether(20));
    });
  });
});