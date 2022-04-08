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
  PerpV2LeverageModuleV2,
  PerpV2BasisTradingModule,
  SlippageIssuanceModule,
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
  PerpV2LeverageModuleV2__factory,
  PerpV2BasisTradingModule__factory,
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

  public async getPerpV2LeverageModuleV2(
    positionV2Library: Address,
    perpV2LibraryV2: Address,
    perpV2PositionsLibrary: Address,
    perpV2LeverageModuleV2: Address
  ): Promise<PerpV2LeverageModuleV2> {
    return await new PerpV2LeverageModuleV2__factory(
      {
        ["contracts/protocol/lib/PositionV2.sol:PositionV2"]: positionV2Library,
        ["contracts/protocol/integration/lib/PerpV2LibraryV2.sol:PerpV2LibraryV2"]: perpV2LibraryV2,
        ["contracts/protocol/integration/lib/PerpV2Positions.sol:PerpV2Positions"]: perpV2PositionsLibrary
      },
      this._deployerSigner
    ).attach(perpV2LeverageModuleV2);
  }

  public async getPerpV2BasisTradingModule(
    positionV2Library: Address,
    perpV2LibraryV2: Address,
    perpV2PositionsLibrary: Address,
    perpV2BasisTradingModule: Address
  ): Promise<PerpV2BasisTradingModule> {
    return await new PerpV2BasisTradingModule__factory(
      {
        ["contracts/protocol/lib/PositionV2.sol:PositionV2"]: positionV2Library,
        ["contracts/protocol/integration/lib/PerpV2LibraryV2.sol:PerpV2LibraryV2"]: perpV2LibraryV2,
        ["contracts/protocol/integration/lib/PerpV2Positions.sol:PerpV2Positions"]: perpV2PositionsLibrary
      },
      this._deployerSigner
    ).attach(perpV2BasisTradingModule);
  }

  public async getSlippageIssuanceModule(slippageIssuanceModuleAddress: Address): Promise<SlippageIssuanceModule> {
    return await new SlippageIssuanceModule__factory(this._deployerSigner).attach(slippageIssuanceModuleAddress);
  }

  public async getManagerCore(managerCoreAddress: Address): Promise<ManagerCore> {
    return await new ManagerCore__factory(this._deployerSigner).attach(managerCoreAddress);
  }
}