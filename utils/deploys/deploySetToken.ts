import "module-alias/register";

import { Signer } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import { Address } from "../types";

import {
  DebtIssuanceModule,
  StreamingFeeModule,
} from "@setprotocol/set-protocol-v2/typechain";

import {
  Controller__factory,
  DebtIssuanceModule__factory,
  StreamingFeeModule__factory,
} from "@setprotocol/set-protocol-v2/dist/typechain";

import DeploySetV2 from "./deploySetV2";

import { ether, ProtocolUtils } from "@utils/common";

import { getRandomAddress } from "@utils/index";
import { ADDRESS_ZERO } from "../constants";

export type ConfiguredSetTokenAddresses = {
  setToken: Address;
  controller: Address;
  streamingFeeModule: Address;
  debtIssuanceModule: Address;
};

export default class DeploySetToken {
  private _deployerSigner: Signer;
  private _setV2: DeploySetV2;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
    this._setV2 = new DeploySetV2(deployerSigner);
  }

  // Deploys a set token after initializing its modules This is useful if there are post-deployment
  // configuration steps which require a real set token to execute (ex: protectModules)
  public async deployConfiguredSetToken(
    _name: string,
    _symbol: string,
    _controller: Address,
    _streamingFeeModule: Address,
    _debtIssuanceModule: Address
  ): Promise<ConfiguredSetTokenAddresses> {
    let streamingFeeModuleInstance: StreamingFeeModule;
    let debtIssuanceModuleInstance: DebtIssuanceModule;

    const controllerInstance = new Controller__factory(this._deployerSigner).attach(_controller);
    const setTokenCreatorInstance = await this._setV2.deploySetTokenCreator(controllerInstance.address);

    if (!(await controllerInstance.isInitialized())) {
      await controllerInstance.initialize([], [], [], []);
    }

    controllerInstance.addFactory(setTokenCreatorInstance.address);

    const modules = [ _streamingFeeModule, _debtIssuanceModule ].filter(mod => {
      return mod !== "";
    });

    for (const module of modules) {
      if (!(await controllerInstance.isModule(module))) {
        await controllerInstance.addModule(module);
      }
    }

    const tx = await setTokenCreatorInstance.create(
      [await getRandomAddress()],
      [ether(1000000)],
      modules,
      await this._deployerSigner.getAddress(),
      _name,
      _symbol,
    );

    const setTokenAddress = await new ProtocolUtils(this._deployerSigner.provider as JsonRpcProvider)
      .getCreatedSetTokenAddress(tx.hash);

    if (_streamingFeeModule !== "") {
      streamingFeeModuleInstance = new StreamingFeeModule__factory(this._deployerSigner).attach(_streamingFeeModule);

      const feeSettings = {
        feeRecipient: await this._deployerSigner.getAddress(),
        maxStreamingFeePercentage: ether(.1),
        streamingFeePercentage: ether(.01),
        lastStreamingFeeTimestamp: BigNumber.from(0),
      };

      await streamingFeeModuleInstance.connect(this._deployerSigner).initialize(setTokenAddress, feeSettings);
    }

    if (_debtIssuanceModule !== "") {
      debtIssuanceModuleInstance = new DebtIssuanceModule__factory(this._deployerSigner).attach(_debtIssuanceModule);

      await debtIssuanceModuleInstance.connect(this._deployerSigner).initialize(
        setTokenAddress,
        ether(0.1),
        ether(0.01),
        ether(0.01),
        await getRandomAddress(),
        ADDRESS_ZERO
      );
    }

    return {
      setToken: setTokenAddress,
      streamingFeeModule: _streamingFeeModule,
      debtIssuanceModule: _debtIssuanceModule,
      controller: controllerInstance.address,
    };
  }
}
