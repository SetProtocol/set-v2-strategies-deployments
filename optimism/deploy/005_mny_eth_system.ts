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
} from "../deployments/utils/types";

import {
  addExtension,
  deployBaseManager,
  prepareDeployment,
  stageAlreadyFinished,
  trackFinishedStage,
  updateSetManager,
  deployFeeExtension,
  setOperator,
  addApprovedCaller
} from "@utils/deploys/deployUtils";

import {
  DEPENDENCY
} from "../deployments/utils/dependencies";

import {
  CONTRACT_NAMES,
  EXCHANGE_SETTINGS,
  EXECUTION_SETTINGS,
  INCENTIVE_SETTINGS,
  METHODOLOGY_SETTINGS,
  ETH_DECIMALS,
  ETH_USDC_PRICE_FEED_DECIMALS,
  KOVAN_TESTNET_ID,
  PERP_TEST_USDC,
  IC_OPERATOR_MULTISIG,
  ALLOWED_CALLER,
  OPERATOR_FEE_SPLIT
} from "../deployments/constants/005_mny_eth_system";

const {
  MNY_ETH_TOKEN,
  ETHUSD_PERP_CHAINLINK_ORACLE,
  PERPV2_ACCOUNT_BALANCE,
  PERPV2_BASIS_TRADING_MODULE,
  SLIPPAGE_ISSUANCE_MODULE,
  STREAMING_FEE_MODULE,
  TRADE_MODULE,
  UNISWAP_V3_QUOTER,
  USDC,
  WETH,
  V_ETH,
  V_USD,
} = DEPENDENCY;
const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {
  const {
    deploy,
    deployer,
    networkConstant
  } = await prepareDeployment(hre);

  // Deploy BaseManager
  await deployBaseManager(
    hre,
    CONTRACT_NAMES.BASE_MANAGER,
    MNY_ETH_TOKEN,
    deployer,                               // operator
    IC_OPERATOR_MULTISIG                    // methodologist
  );
  const networkId = getNetworkId();

  // Perpetual Protocol has a fully deployed system on Optimistic Kovan. You can get the
  // kovan test USDC it uses from faucet at: https://kovan.optifaucet.com/
  const usdcTokenAddress = (networkId === KOVAN_TESTNET_ID)
    ? await findDependency(PERP_TEST_USDC)
    : await findDependency(USDC);

  // Deploy strategy extension
  await deployBasisTradingStrategyExtension();

  const streamingFeeModuleAddress = await findDependency(STREAMING_FEE_MODULE);
  const issuanceModuleAddress = await findDependency(SLIPPAGE_ISSUANCE_MODULE);

  // Deploy fee split extension
  await deployFeeExtension(
    hre,
    CONTRACT_NAMES.FEE_SPLIT_EXTENSION,
    CONTRACT_NAMES.BASE_MANAGER,
    OPERATOR_FEE_SPLIT,
    IC_OPERATOR_MULTISIG,
    streamingFeeModuleAddress,
    issuanceModuleAddress
  );

  // Add extensions to manager
  await addExtension(hre, CONTRACT_NAMES.BASE_MANAGER, CONTRACT_NAMES.STRATEGY_EXTENSION);
  await addExtension(hre, CONTRACT_NAMES.BASE_MANAGER, CONTRACT_NAMES.FEE_SPLIT_EXTENSION);

  // Add approved caller to strategy extension
  await addApprovedCaller(hre, CONTRACT_NAMES.STRATEGY_EXTENSION, [ALLOWED_CALLER], [true]);

  // Set manager to BaseManager
  if (networkConstant !== "development") {
    await updateSetManager(hre, MNY_ETH_TOKEN, CONTRACT_NAMES.BASE_MANAGER);
  }

  // Finally set operator to IC Operator multisig
  await setOperator(hre, CONTRACT_NAMES.BASE_MANAGER, IC_OPERATOR_MULTISIG);

  async function deployBasisTradingStrategyExtension(): Promise<void> {
    const checkStrategyExtensionAddress = await getContractAddress(CONTRACT_NAMES.STRATEGY_EXTENSION);
    if (checkStrategyExtensionAddress == "") {
      const manager = await getContractAddress(CONTRACT_NAMES.BASE_MANAGER);

      const contractSettings: PerpV2BasisContractSettings = {
        setToken: await findDependency(MNY_ETH_TOKEN),
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

      const extensionDeploy = await deploy("DeltaNeutralBasisTradingStrategyExtension", {
        from: deployer,
        args: constructorArgs,
        log: true
      });

      extensionDeploy.receipt && await saveContractDeployment({
        name: CONTRACT_NAMES.STRATEGY_EXTENSION,
        contractAddress: extensionDeploy.address,
        id: extensionDeploy.receipt.transactionHash,
        description: "Deployed MNYeBasisTradingStrategyExtension",
        constructorArgs
      });
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;
