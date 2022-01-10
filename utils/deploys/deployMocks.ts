import "module-alias/register";

import { Signer } from "ethers";
import { Address } from "../types";

import {
  MutualUpgradeMock,
  MutualUpgradeMock__factory
} from "@set/typechain/index";

export default class DeployMocks {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async deployMutualUpgradeMock(owner: Address, methodologist: string): Promise<MutualUpgradeMock> {
    return await new MutualUpgradeMock__factory(this._deployerSigner).deploy(owner, methodologist);
  }
}
