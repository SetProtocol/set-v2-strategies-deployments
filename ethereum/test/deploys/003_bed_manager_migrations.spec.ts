import "module-alias/register";
import { deployments } from "hardhat";

import { Account } from "@utils/types";

import {
  DelegatedManager,
  DelegatedManager__factory
} from "@set/typechain/index";

import {
  SetToken
} from "@setprotocol/set-protocol-v2/typechain";

import {
  SetToken__factory
} from "@setprotocol/set-protocol-v2/dist/typechain";

import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
  findDependency,
} from "@utils/index";

import { DEPENDENCY } from "../../deployments/utils/dependencies";

const {
  BED,
  BED_METHODOLOGIST,
  BED_OPERATOR_V1,
  DELEGATED_MANAGER_FACTORY,
  TRADE_EXTENSION,
  ISSUANCE_EXTENSION,
  FEE_EXTENSION
} = DEPENDENCY;

const expect = getWaffleExpect();

describe("BED DelegatedManager Migration", () => {
  let deployer: Account;

  let bedInstance: SetToken;
  let delegatedManagerInstance: DelegatedManager;

  before(async () => {
    [deployer] = await getAccounts();

    await deployments.fixture();

    const bedAddress = await findDependency(BED);
    bedInstance = new SetToken__factory(deployer.wallet).attach(bedAddress);

    const delegatedManagerAddress = await bedInstance.manager();
    delegatedManagerInstance = new DelegatedManager__factory(deployer.wallet).attach(
      delegatedManagerAddress
    );
  });

  addSnapshotBeforeRestoreAfterEach();

  it("has a manager deployed by the factory", async () => {
    const expectedFactory = await findDependency(DELEGATED_MANAGER_FACTORY);
    const factory = await delegatedManagerInstance.factory();

    expect(factory).to.equal(expectedFactory);
  });

  it("has the expected methodologist", async () => {
    const expectedMethodologist = (await findDependency(BED_METHODOLOGIST)).toLowerCase();
    const methodologist = (await delegatedManagerInstance.methodologist()).toLowerCase();
    expect(methodologist).to.eq(expectedMethodologist);
  });

  it("has the expected owner", async () => {
    const expectedOwner = (await findDependency(BED_OPERATOR_V1)).toLowerCase();
    const owner = (await delegatedManagerInstance.owner()).toLowerCase();
    expect(owner).to.eq(expectedOwner);
  });

  it("has owner as an operator", async () => {
    const owner = await delegatedManagerInstance.owner();
    const operators = await delegatedManagerInstance.getOperators();
    expect(operators.includes(owner)).to.be.true;
  });

  it("has correct initialized extensions", async () => {
    const extensions = await delegatedManagerInstance.getExtensions();

    const tradeExtension = await findDependency(TRADE_EXTENSION);
    const issuanceExtension = await findDependency(ISSUANCE_EXTENSION);
    const feeExtension = await findDependency(FEE_EXTENSION);

    expect(await extensions.includes(tradeExtension)).to.be.true;
    expect(await extensions.includes(issuanceExtension)).to.be.true;
    expect(await extensions.includes(feeExtension)).to.be.true;

    expect(await delegatedManagerInstance.isInitializedExtension(tradeExtension)).to.be.true;
    expect(await delegatedManagerInstance.isInitializedExtension(issuanceExtension)).to.be.true;
    expect(await delegatedManagerInstance.isInitializedExtension(feeExtension)).to.be.true;
  });

  it("has all components as allowed assets", async () => {
    const components = await bedInstance.getComponents();

    for (const component of components) {
      const isAllowedAsset = await delegatedManagerInstance.isAllowedAsset(component);
      expect(isAllowedAsset).to.be.true;
    }
  });
});