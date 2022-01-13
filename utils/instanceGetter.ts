import "module-alias/register";

import {
  BaseExtension,
  BaseExtension__factory,
  BaseManager,
  BaseManager__factory
} from "@set/typechain/index";

import {
  Controller,
  DebtIssuanceModule,
  GeneralIndexModule,
  SetTokenCreator,
  StreamingFeeModule
} from "@setprotocol/set-protocol-v2/typechain";

import {
  Controller__factory,
  DebtIssuanceModule__factory,
  GeneralIndexModule__factory,
  SetTokenCreator__factory,
  StreamingFeeModule__factory
} from "@setprotocol/set-protocol-v2/dist/typechain";

import { Signer } from "ethers";

import { Address } from "@utils/types";

export class InstanceGetter {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async getBaseManager(managerAddress: Address): Promise<BaseManager> {
    return await new BaseManager__factory(this._deployerSigner).attach(managerAddress);
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