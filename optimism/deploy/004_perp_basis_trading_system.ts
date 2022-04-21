import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ZERO } from "@utils/constants";
import { BigNumber } from "ethers";
import { solidityPack } from "ethers/lib/utils";

import {
  findDependency,
  getContractAddress,
  getCurrentStage,
  saveContractDeployment,
  getNetworkId
} from "@utils/outputHelper";

import {
  PerpV2BasisContractSettings
} from "./../deployments/utils/types";

import {
  addExtension,
  deployBaseManager,
  prepareDeployment,
  stageAlreadyFinished,
  trackFinishedStage,
  updateSetManager,
} from "@utils/deploys/deployUtils";

import {
  DEPENDENCY
} from "./../deployments/utils/dependencies";

import {
  CONTRACT_NAMES,
  EXCHANGE_SETTINGS,
  EXECUTION_SETTINGS,
  INCENTIVE_SETTINGS,
  METHODOLOGY_SETTINGS,
  ETH_DECIMALS,
  ETH_USDC_PRICE_FEED_DECIMALS,
  KOVAN_TESTNET_ID,
  PERP_TEST_USDC
} from "./../deployments/constants/004_perp_basis_trading_system";

const {
  UNISWAP_V3_QUOTER,
  TRADE_MODULE,
  TEST_BASIS_TOKEN,
  PERPV2_ACCOUNT_BALANCE,
  PERPV2_BASIS_TRADING_MODULE,
  WETH,
  USDC,
  V_ETH,
  V_USD,
  ETHUSD_PERP_CHAINLINK_ORACLE,
} = DEPENDENCY;
const CURRENT_STAGE = getCurrentStage(__filename);


const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {
  const contexts = ["development", "staging"];

  const {
    deploy,
    deployer,
    networkConstant
  } = await prepareDeployment(hre);

  // Configure: Script is skipped by default except for testing
  const SHOULD_SKIP = true;
  if (SHOULD_SKIP && !contexts.includes(networkConstant)) return;

  // Deploy BaseManager
  await deployBaseManager(
    hre,
    CONTRACT_NAMES.BASE_MANAGER,
    TEST_BASIS_TOKEN,
    deployer,
    deployer
  );
  const networkId = getNetworkId();

  // Perpetual Protocol has a fully deployed system on Optimistic Kovan. You can get the
  // kovan test USDC it uses from faucet at: https://kovan.optifaucet.com/
  const usdcTokenAddress = (networkId === KOVAN_TESTNET_ID)
    ? await findDependency(PERP_TEST_USDC)
    : await findDependency(USDC);

  // Deploy strategy extension
  await deployBasisTradingStrategyExtension();

  // Add strategy extension to manager
  await addExtension(hre, CONTRACT_NAMES.BASE_MANAGER, CONTRACT_NAMES.STRATEGY_EXTENSION);

  // Set manager to BaseManager
  if (networkConstant !== "development") {
    await updateSetManager(hre, TEST_BASIS_TOKEN, CONTRACT_NAMES.BASE_MANAGER);
  }

  async function deployBasisTradingStrategyExtension(): Promise<void> {
    const checkStrategyExtensionAddress = await getContractAddress(CONTRACT_NAMES.STRATEGY_EXTENSION);
    if (checkStrategyExtensionAddress == "") {
      const manager = await getContractAddress(CONTRACT_NAMES.BASE_MANAGER);

      const contractSettings: PerpV2BasisContractSettings = {
        setToken: await findDependency(TEST_BASIS_TOKEN),
        basisTradingModule: await findDependency(PERPV2_BASIS_TRADING_MODULE),
        tradeModule: await findDependency(TRADE_MODULE),
        quoter: await findDependency(UNISWAP_V3_QUOTER),
        perpV2AccountBalance: await findDependency(PERPV2_ACCOUNT_BALANCE),
        baseUSDPriceOracle: await findDependency(ETHUSD_PERP_CHAINLINK_ORACLE),
        twapInterval: ZERO,
        basePriceDecimalAdjustment: BigNumber.from(ETH_DECIMALS).sub(ETH_USDC_PRICE_FEED_DECIMALS),
        virtualBaseAddress: await findDependency(V_ETH),
        virtualQuoteAddress: await findDependency(V_USD),
        spotAssetAddress: await findDependency(WETH)
      };

      const methodlogySettings = METHODOLOGY_SETTINGS;
      const executionSettings = EXECUTION_SETTINGS;
      const exchangeSettings = EXCHANGE_SETTINGS;
      const incentiveSettings = INCENTIVE_SETTINGS;

      exchangeSettings.buyExactSpotTradeData = solidityPack(
        ["address", "uint24", "address", "bool"],
        [await findDependency(WETH), BigNumber.from(3000), usdcTokenAddress, false]
      );
      exchangeSettings.sellExactSpotTradeData = solidityPack(
        ["address", "uint24", "address", "bool"],
        [await findDependency(WETH), BigNumber.from(3000), usdcTokenAddress, true],
      );
      exchangeSettings.buySpotQuoteExactInputPath = solidityPack(
        ["address", "uint24", "address"],
        [usdcTokenAddress, BigNumber.from(3000), await findDependency(WETH)]
      );

      const constructorArgs = [
        manager,
        contractSettings,
        methodlogySettings,
        executionSettings,
        incentiveSettings,
        exchangeSettings
      ];

      const extensionDeploy = await deploy(CONTRACT_NAMES.STRATEGY_EXTENSION, {
        from: deployer,
        args: constructorArgs,
        log: true
      });

      extensionDeploy.receipt && await saveContractDeployment({
        name: CONTRACT_NAMES.STRATEGY_EXTENSION,
        contractAddress: extensionDeploy.address,
        id: extensionDeploy.receipt.transactionHash,
        description: "Deployed DeltaNeutralBasisTradingStrategyExtension",
        constructorArgs
      });
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;
