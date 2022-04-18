import { BigNumber } from "@ethersproject/bignumber";
import { ether } from "@utils/index";

import { ONE_HOUR_IN_SECONDS } from "@utils/constants";

export const CONTRACT_NAMES = {
  BASE_MANAGER: "PerpV2BaseManager",
  STANDARD_TOKEN_MOCK: "StandardTokenMock",
  STRATEGY_EXTENSION: "DeltaNeutralBasisTradingStrategyExtension"
};

export const METHODOLOGY_SETTINGS = {
  targetLeverageRatio: ether(-1),
  minLeverageRatio: ether(-0.9),
  maxLeverageRatio: ether(-1.1),
  recenteringSpeed: ether(0.1),
  rebalanceInterval: ONE_HOUR_IN_SECONDS.mul(2),
  reinvestInterval: ONE_HOUR_IN_SECONDS
};

export const EXECUTION_SETTINGS = {
  twapCooldownPeriod: BigNumber.from(30),                  // 30 sec cooldown
  slippageTolerance: ether(0.02),                          // 2% max slippage on regular rebalances
};

export const INCENTIVE_SETTINGS = {
  incentivizedTwapCooldownPeriod: BigNumber.from(1),      // 1 sec cooldown on ripcord
  incentivizedSlippageTolerance: ether(0.05),             // 5% max slippage on ripcord
  etherReward: ether(1),
  incentivizedLeverageRatio: ether(-1.8),
};

export const EXCHANGE_SETTINGS = {
  exchangeName: "UniswapV3ExchangeAdapterV2",
  buyExactSpotTradeData: "",                          // will be overriden in the deploy script
  sellExactSpotTradeData: "",                         // will be overriden in the deploy script
  buySpotQuoteExactInputPath: "",                     // will be overriden in the deploy script
  twapMaxTradeSize: ether(10),
  incentivizedTwapMaxTradeSize: ether(20)
};

export const ETH_DECIMALS = 18;
export const ETH_USDC_PRICE_FEED_DECIMALS = 8;

export const PERP_TEST_USDC = "PERP_TEST_USDC";
export const KOVAN_TESTNET_ID = 69;
