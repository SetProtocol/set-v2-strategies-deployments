import "module-alias/register";
import { deployments } from "hardhat";

import { Account } from "@utils/types";

import { ExchangeIssuanceZeroEx } from "@indexcoop/index-coop-smart-contracts/typechain";
import { ExchangeIssuanceZeroEx__factory } from "@indexcoop/index-coop-smart-contracts/dist/typechain";

import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
  findDependency,
  getContractAddress,
} from "@utils/index";
import { DEPENDENCY } from "../../deployments/utils/dependencies";
import { CONTRACT_NAMES } from "../../deployments/constants/001_exchangeIssuanceZeroEx";

const { WMATIC, CONTROLLER, ZERO_EX_EXCHANGE } = DEPENDENCY;

const expect = getWaffleExpect();

describe("ExchangeIssuanceZeroEx", () => {
  let deployer: Account;

  let exchangeIssuanceInstance: ExchangeIssuanceZeroEx;

  before(async () => {
    [deployer] = await getAccounts();

    await deployments.fixture();

    const deployedExchangeIssuanceContract = await getContractAddress(
      CONTRACT_NAMES.EXCHANGE_ISSUANCE_ZEROEX,
    );

    exchangeIssuanceInstance = new ExchangeIssuanceZeroEx__factory(deployer.wallet).attach(
      deployedExchangeIssuanceContract,
    );
  });

  addSnapshotBeforeRestoreAfterEach();

  it("has correct owner", async () => {
    expect(await exchangeIssuanceInstance.owner()).to.equal(deployer.address);
  });

  it("has correct wMATIC address", async () => {
    const wMATICAddress = await findDependency(WMATIC);
    expect(await exchangeIssuanceInstance.WETH()).to.equal(wMATICAddress);
  });

  it("has correct zero ex exchange", async () => {
    const exchangeProxyAddress = await findDependency(ZERO_EX_EXCHANGE);
    expect(await exchangeIssuanceInstance.swapTarget()).to.equal(exchangeProxyAddress);
  });

  it("has correct set controller", async () => {
    const controllerAddress = await findDependency(CONTROLLER);
    expect(await exchangeIssuanceInstance.setController()).to.equal(controllerAddress);
  });
});
