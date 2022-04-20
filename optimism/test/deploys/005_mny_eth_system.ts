import "module-alias/register";
import { deployments } from "hardhat";
import { MAX_UINT_256, ONE_DAY_IN_SECONDS, ZERO } from "@utils/constants";
import { solidityPack } from "ethers/lib/utils";
import { usdc } from "@utils/common/unitsUtils";

import { Account } from "@utils/types";
import {
  BaseManager,
  BaseManager__factory,
  FeeSplitExtension,
  DeltaNeutralBasisTradingStrategyExtension,
  DeltaNeutralBasisTradingStrategyExtension__factory,
  FeeSplitExtension__factory
} from "@set/typechain/index";

import {
  ALLOWED_CALLER,
  IC_OPERATOR_MULTISIG,
  KOVAN_TESTNET_ID
} from "../../deployments/constants/005_mny_eth_system";

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

describe("MNYe Basis Trading System", () => {
  let deployer: Account;

  let baseManagerInstance: BaseManager;
  let strategyExtensionInstance: DeltaNeutralBasisTradingStrategyExtension;
  let feeSplitExtensionInstance: FeeSplitExtension;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const deployedBaseManagerContract = await getContractAddress("MNYeBaseManager");
    baseManagerInstance = new BaseManager__factory(deployer.wallet).attach(deployedBaseManagerContract);

    const deployedFeeSplitAdapter = await getContractAddress("MNYeFeeSplitExtension");
    feeSplitExtensionInstance = new FeeSplitExtension__factory(deployer.wallet).attach(deployedFeeSplitAdapter);

    const deployedStrategyAdapterContract = await getContractAddress("MNYeBasisTradingStrategyExtension");
    strategyExtensionInstance = new
    DeltaNeutralBasisTradingStrategyExtension__factory(deployer.wallet).attach(deployedStrategyAdapterContract);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("MNYeBaseManager", async () => {
    it("should have the correct SetToken address", async () => {
      const setToken = await baseManagerInstance.setToken();
      expect(setToken).to.eq(await findDependency("MNY_ETH_TOKEN"));
    });

    it("should have the correct operator address", async () => {
      const operator = await baseManagerInstance.operator();
      expect(operator).to.eq(IC_OPERATOR_MULTISIG);
    });

    it("should have the correct methodologist address", async () => {
      const methodologist = await baseManagerInstance.methodologist();
      expect(methodologist).to.eq(IC_OPERATOR_MULTISIG);
    });

    it("should have the correct adapters", async () => {
      const adapters = await baseManagerInstance.getAdapters();
      expect(adapters[0]).to.eq(strategyExtensionInstance.address);
      expect(adapters[1]).to.eq(feeSplitExtensionInstance.address);
    });
  });

  describe("MNYeFeeSplitExtension", async () => {
    it("should set the manager", async () => {
      const manager = await feeSplitExtensionInstance.manager();
      expect(manager).to.eq(baseManagerInstance.address);
    });

    it("should set the correct operator fee recipient", async () => {
      const operatorFeeRecipient = await feeSplitExtensionInstance.operatorFeeRecipient();
      expect(operatorFeeRecipient).to.eq(IC_OPERATOR_MULTISIG);
    });

    it("should set the correct operator fee split", async () => {
      const operatorFeeSplit = await feeSplitExtensionInstance.operatorFeeSplit();
      expect(operatorFeeSplit).to.eq(ether(1));
    });
  });

  describe("MNYeBasisTradingStrategyExtension", async () => {
    it("should set the manager", async () => {
      const manager = await strategyExtensionInstance.manager();

      expect(manager).to.eq(baseManagerInstance.address);
    });

    it("should set the contract addresses", async () => {
      const strategy = await strategyExtensionInstance.getStrategy();

      expect(strategy.setToken).to.eq(await findDependency("MNY_ETH_TOKEN"));
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
      expect(methodology.maxLeverageRatio).to.eq(ether(-2));
      expect(methodology.recenteringSpeed).to.eq(ether(1));
      expect(methodology.rebalanceInterval).to.eq(MAX_UINT_256);
      expect(methodology.reinvestInterval).to.eq(ONE_DAY_IN_SECONDS.mul(7));
      expect(methodology.minReinvestUnits).to.eq(usdc(0.01));
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
      expect(incentive.incentivizedLeverageRatio).to.eq(ether(-3));
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
      expect(exchange.twapMaxTradeSize).to.eq(ether(30));
      expect(exchange.incentivizedTwapMaxTradeSize).to.eq(ether(60));
    });

    it("should have caller added to list of allowed callers", async () => {
      const isCallerAllowed = await strategyExtensionInstance.callAllowList(ALLOWED_CALLER);
      expect(isCallerAllowed).to.eq(true);
    });
  });
});