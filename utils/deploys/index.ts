import { Signer } from "ethers";

import DeployMocks from "./deployMocks";
import DeploySetV2 from "./deploySetV2";
import DeploySetToken from "./deploySetToken";


export default class DeployHelper {
  public setV2: DeploySetV2;
  public mocks: DeployMocks;
  public setToken: DeploySetToken;

  constructor(deployerSigner: Signer) {
    this.setV2 = new DeploySetV2(deployerSigner);
    this.mocks = new DeployMocks(deployerSigner);
    this.setToken = new DeploySetToken(deployerSigner);
  }
}

export * from "../outputHelper";
