import { BigNumber } from "@ethersproject/bignumber";
import { ether } from "@utils/index";

import { ONE_DAY_IN_SECONDS } from "@utils/constants";

export const CONTRACT_NAMES = {
  BASE_MANAGER: "BaseManager",
  STANDARD_TOKEN_MOCK: "StandardTokenMock",
  LEVERAGE_EXTENSION: "PerpV2LeverageStrategyExtension",
  PERP_V2_LEVERAGE_MODULE: "PerpV2LeverageModule"
};

export const METHODOLOGY_SETTINGS = {
  targetLeverageRatio: ether(2),
  minLeverageRatio: ether(1.7),
  maxLeverageRatio: ether(2.3),
  recenteringSpeed: ether(0.1),
  rebalanceInterval: ONE_DAY_IN_SECONDS,
};

export const EXECUTION_SETTINGS = {
  twapCooldownPeriod: BigNumber.from(30),                  // 30 sec cooldown
  slippageTolerance: ether(0.02),                          // 2% max slippage on regular rebalances
};

export const INCENTIVE_SETTINGS = {
  incentivizedTwapCooldownPeriod: BigNumber.from(1),      // 1 sec cooldown on ripcord
  incentivizedSlippageTolerance: ether(0.05),             // 5% max slippage on ripcord
  etherReward: ether(1),
  incentivizedLeverageRatio: ether(2.7),
};

export const EXCHANGE_SETTINGS = {
  twapMaxTradeSize: ether(10),
  incentivizedTwapMaxTradeSize: ether(20)
};