import "module-alias/register";
import { deployments } from "hardhat";

import { Account } from "@utils/types";

import { DebtIssuanceModuleV2 } from "@setprotocol/set-protocol-v2/typechain/DebtIssuanceModuleV2";
import { DebtIssuanceModuleV2__factory } from "@setprotocol/set-protocol-v2/typechain/factories/DebtIssuanceModuleV2__factory";

import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
  findDependency,
  getContractAddress,
} from "@utils/index";
import { DEPENDENCY } from "../../deployments/utils/dependencies";
import { CONTRACT_NAMES } from "../../deployments/constants/002_issuanceModule";

const { CONTROLLER } = DEPENDENCY;

const expect = getWaffleExpect();

describe("IssuanceModule", () => {
  let deployer: Account;

  let issuanceModuleInstance: DebtIssuanceModuleV2;

  before(async () => {
    [deployer] = await getAccounts();

    await deployments.fixture();

    const deployedIssuanceModuleContract = await getContractAddress(CONTRACT_NAMES.ISSUANCE_MODULE);
    issuanceModuleInstance = new DebtIssuanceModuleV2__factory(deployer.wallet).attach(deployedIssuanceModuleContract);
  });

  addSnapshotBeforeRestoreAfterEach();

  it("should should be deployed", async () => {
    expect(issuanceModuleInstance).to.be.exist;
  });

  it("should have the correct Controller address", async () => {
    const setController = await issuanceModuleInstance.setController();
    expect(setController).to.eq(await findDependency(CONTROLLER));
  });
});