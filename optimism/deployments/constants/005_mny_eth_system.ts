import { BigNumber } from "@ethersproject/bignumber";
import { ether } from "@utils/index";

import { ONE_DAY_IN_SECONDS ,MAX_UINT_256 } from "@utils/constants";

export const CONTRACT_NAMES = {
  BASE_MANAGER: "MNYeBaseManager",
  STANDARD_TOKEN_MOCK: "StandardTokenMock",
  STRATEGY_EXTENSION: "MNYeBasisTradingStrategyExtension",
  FEE_SPLIT_EXTENSION: "MNYeFeeSplitExtension"
};

export const IC_OPERATOR_MULTISIG = "0xA047F6900FeE0b6195088a49009eA65365f7DD68";

export const ALLOWED_CALLER = "0x17d3FdB23128F8e376ffA444B8A84A30573864a6";

export const OPERATOR_FEE_SPLIT = ether(1);            // 100%

export const METHODOLOGY_SETTINGS = {
  targetLeverageRatio: ether(-1),                       // -1x
  minLeverageRatio: ether(-0.95),                       // -0.95x
  maxLeverageRatio: ether(-2),                          // -2x
  recenteringSpeed: ether(1),                           // N/A; Unused value; Can't be set to 0; So set to 1
  rebalanceInterval: MAX_UINT_256,                      // Rebalance only when out of bounds
  reinvestInterval: ONE_DAY_IN_SECONDS.mul(7),          // 7 days
  minReinvestUnits: BigNumber.from(10)                  // Minimum reinvestment units (todo)
};

export const EXECUTION_SETTINGS = {
  twapCooldownPeriod: BigNumber.from(30),               // 30 sec cooldown
  slippageTolerance: ether(0.02),                       // 2% max slippage on regular rebalances
};

export const INCENTIVE_SETTINGS = {
  incentivizedTwapCooldownPeriod: BigNumber.from(1),    // 1 sec cooldown on ripcord
  incentivizedSlippageTolerance: ether(0.05),           // 5% max slippage on ripcord
  etherReward: ether(1),                                // 1 ETH
  incentivizedLeverageRatio: ether(-3),                 // 3x
};

export const EXCHANGE_SETTINGS = {
  exchangeName: "UniswapV3ExchangeAdapterV2",
  buyExactSpotTradeData: "",                            // will be overriden in the deploy script
  sellExactSpotTradeData: "",                           // will be overriden in the deploy script
  buySpotQuoteExactInputPath: "",                       // will be overriden in the deploy script
  twapMaxTradeSize: ether(30),                          // 30 ETH
  incentivizedTwapMaxTradeSize: ether(60)               // 60 ETH
};

export const ETH_DECIMALS = 18;                         // vETH decimals
export const ETH_USDC_PRICE_FEED_DECIMALS = 8;          // ETHUSD chainlink price feed decimals

export const PERP_TEST_USDC = "PERP_TEST_USDC";
export const KOVAN_TESTNET_ID = 69;
