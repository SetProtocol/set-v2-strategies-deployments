import "module-alias/register";

import {
  BaseExtension,
  BaseExtension__factory,
  BaseManager,
  BaseManager__factory,
  ManagerCore,
  ManagerCore__factory,
} from "@set/typechain/index";

import {
  Controller,
  DebtIssuanceModule,
  GeneralIndexModule,
  SetToken,
  SetTokenCreator,
  IntegrationRegistry,
  StreamingFeeModule,
  StandardTokenMock,
  PerpV2LeverageModule,
  SlippageIssuanceModule
} from "@setprotocol/set-protocol-v2/typechain";

import {
  Controller__factory,
  DebtIssuanceModule__factory,
  GeneralIndexModule__factory,
  SetToken__factory,
  SetTokenCreator__factory,
  IntegrationRegistry__factory,
  StreamingFeeModule__factory,
  StandardTokenMock__factory,
  PerpV2LeverageModule__factory,
  SlippageIssuanceModule__factory
} from "@setprotocol/set-protocol-v2/dist/typechain";

import { Signer } from "ethers";

import { Address } from "@utils/types";

export class InstanceGetter {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async getSetToken(setTokenAddr: Address): Promise<SetToken> {
    return await new SetToken__factory(this._deployerSigner).attach(setTokenAddr);
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

  public async getIntegrationRegistry(integrationRegistryAddress: Address): Promise<IntegrationRegistry> {
    return await new IntegrationRegistry__factory(this._deployerSigner).attach(integrationRegistryAddress);
  }

  public async getTokenMock(token: Address): Promise<StandardTokenMock> {
    return await new StandardTokenMock__factory(this._deployerSigner).attach(token);
  }

  public async getPerpV2LeverageModule(perpV2Library: Address, perpV2LeverageModule: Address): Promise<PerpV2LeverageModule> {
    return await new PerpV2LeverageModule__factory(
      {
        ["contracts/protocol/integration/lib/PerpV2.sol:PerpV2"]: perpV2Library,
      },
      this._deployerSigner
    ).attach(perpV2LeverageModule);
  }

  public async getSlippageIssuanceModule(slippageIssuanceModuleAddress: Address): Promise<SlippageIssuanceModule> {
    return await new SlippageIssuanceModule__factory(this._deployerSigner).attach(slippageIssuanceModuleAddress);
  }

  public async getManagerCore(managerCoreAddress: Address): Promise<ManagerCore> {
    return await new ManagerCore__factory(this._deployerSigner).attach(managerCoreAddress);
  }
}