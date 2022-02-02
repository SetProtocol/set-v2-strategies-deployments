import "module-alias/register";
import { deployments } from "hardhat";

import { Account } from "@utils/types";
import { SetToken } from "@setprotocol/set-protocol-v2/typechain";
import { SetToken__factory } from "@setprotocol/set-protocol-v2/dist/typechain";

import {
  ether,
  getAccounts,
  getWaffleExpect,
} from "@utils/index";
import {
  findDependency,
  getContractAddress,
} from "@utils/deploys";
import {
  ZERO
} from "@utils/constants";


const expect = getWaffleExpect();

describe("Perp Enabled SetToken ", () => {
  let deployer: Account;

  let setTokenInstance: SetToken;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const deployedSetToken = await getContractAddress("MY_PERP_TOKEN");
    setTokenInstance = new SetToken__factory(deployer.wallet).attach(deployedSetToken);
  });

  describe("SetToken", async () => {
    it("should have a default USDC position", async () => {
      const usdcAddress = await findDependency("USDC");
      const defaultPosition = await setTokenInstance.getDefaultPositionRealUnit(usdcAddress);
      expect(defaultPosition).to.be.gt(ZERO);
    });

    it("should have a total supply of 1", async () => {
      const totalSupply = await setTokenInstance.totalSupply();
      const issueFee = ether(.005);
      const expectedSupply = ether(1).add(issueFee);
      expect(totalSupply).to.eq(expectedSupply);
    });

    it("should be initialized on the SlippageIssuanceModule", async () => {
      const issuanceModuleAddress = await findDependency("SLIPPAGE_ISSUANCE_MODULE");
      const isInitialized = await setTokenInstance.isInitializedModule(issuanceModuleAddress);
      expect(isInitialized).to.eq(true);
    });

    it("should be initialized on the StreamingFeeModule", async () => {
      const streamingFeeModuleAddress = await findDependency("STREAMING_FEE_MODULE");
      const isInitialized = await setTokenInstance.isInitializedModule(streamingFeeModuleAddress);
      expect(isInitialized).to.eq(true);
    });

    it("should be initialized on the PerpV2LeverageModule", async () => {
      const leverageModuleAddress = await findDependency("PERPV2_LEVERAGE_MODULE");
      const isInitialized = await setTokenInstance.isInitializedModule(leverageModuleAddress);
      expect(isInitialized).to.eq(true);
    });
  });
});