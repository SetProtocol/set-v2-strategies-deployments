import { ethers } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";

export const bitcoin = (amount: number): BigNumber => {
  const btcBaseUnit = BigNumber.from("100000000").mul(amount);
  return BigNumber.from(btcBaseUnit);
};

export const ether = (amount: number): BigNumber => {
  const weiString = ethers.utils.parseEther(amount.toString());
  return BigNumber.from(weiString);
};

export const gWei = (amount: number): BigNumber => {
  const weiString = BigNumber.from("1000000000").mul(amount);
  return BigNumber.from(weiString);
};