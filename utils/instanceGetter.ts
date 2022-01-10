import "module-alias/register";

import {
  BaseExtension,
  BaseExtension__factory,
  BaseManagerV2,
  BaseManagerV2__factory
} from "@set/typechain/index";

import {
  Controller,
  Controller__factory,
  DebtIssuanceModule,
  DebtIssuanceModule__factory,
  GeneralIndexModule,
  GeneralIndexModule__factory,
  SetTokenCreator,
  SetTokenCreator__factory,
  StreamingFeeModule,
  StreamingFeeModule__factory
} from "@setprotocol/set-protocol-v2/typechain/index";

import { Signer } from "ethers";

import { Address } from "@utils/types";

export class InstanceGetter {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async getBaseManagerV2(icManagerV2Address: Address): Promise<BaseManagerV2> {
    return await new BaseManagerV2__factory(this._deployerSigner).attach(icManagerV2Address);
  }

  public async getExtension(extension: Address): Promise<BaseExtension> {
    return await BaseExtension__factory.connect(extension, this._deployerSigner);
  }

  public async getGeneralIndexModule(gimAddr: Address): Promise<GeneralIndexModule> {
    return await new GeneralIndexModule__factory(this._deployerSigner).attach(gimAddr);
  }

  public async getDebtIssuanceModule(dimAddr: Address): Promise<DebtIssuanceModule> {
    return await new DebtIssuanceModule__factory(this._deployerSigner).attach(dimAddr);
  }

  public async getStreamingFeeModule(streamingFeeModuleAddr: Address): Promise<StreamingFeeModule> {
    return await new StreamingFeeModule__factory(this._deployerSigner).attach(streamingFeeModuleAddr);
  }

  public async getController(controllerAddr: Address): Promise<Controller> {
    return await new Controller__factory(this._deployerSigner).attach(controllerAddr);
  }

  public async getSetTokenCreator(setTokenCreatorAddr: Address): Promise<SetTokenCreator> {
    return await new SetTokenCreator__factory(this._deployerSigner).attach(setTokenCreatorAddr);
  }
}