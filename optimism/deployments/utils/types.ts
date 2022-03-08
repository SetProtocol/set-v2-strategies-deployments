import { BigNumber } from "ethers";

export type Address = string;
export type Bytes = string;

export interface PerpV2ContractSettings {
  setToken: Address;
  perpV2LeverageModule: Address;
  perpV2AccountBalance: Address;
  baseUSDPriceOracle: Address;
  twapInterval: BigNumber;
  basePriceDecimalAdjustment: BigNumber;
  virtualBaseAddress: Address;
  virtualQuoteAddress: Address;
}

export interface PerpV2MethodologySettings {
  targetLeverageRatio: BigNumber;
  minLeverageRatio: BigNumber;
  maxLeverageRatio: BigNumber;
  recenteringSpeed: BigNumber;
  rebalanceInterval: BigNumber;
}

export interface PerpV2ExecutionSettings {
  slippageTolerance: BigNumber;
  twapCooldownPeriod: BigNumber;
}

export interface PerpV2ExchangeSettings {
  twapMaxTradeSize: BigNumber;
  incentivizedTwapMaxTradeSize: BigNumber;
}

export interface PerpV2IncentiveSettings {
  etherReward: BigNumber;
  incentivizedLeverageRatio: BigNumber;
  incentivizedSlippageTolerance: BigNumber;
  incentivizedTwapCooldownPeriod: BigNumber;
}