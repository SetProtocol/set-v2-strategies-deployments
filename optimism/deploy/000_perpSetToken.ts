import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { ADDRESS_ZERO, ZERO, MAX_UINT_256 } from "@utils/constants";
import {
  findDependency,
  getContractAddress,
  getCurrentStage,
  getNetworkId,
  writeTransactionToOutputs,
  saveContractDeployment,
} from "@utils/outputHelper";
import { Account } from "@utils/types";
import { InstanceGetter } from "@utils/instanceGetter";
import { ProtocolUtils } from "@utils/protocolUtils";
import { getAccounts } from "@utils/accountUtils";
import { ether, usdc } from "@utils/common/unitsUtils";
import { stageAlreadyFinished, trackFinishedStage, prepareDeployment } from "@utils/deploys/deployUtils";

import {
  CONTRACT_NAMES,
  SET_TOKEN_CREATOR,
  STREAMING_FEE_MODULE,
  PERPV2_LIBRARY_V2,
  POSITION_V2,
  PERP_V2_POSITIONS,
  PERPV2_LEVERAGE_MODULE,
  SLIPPAGE_ISSUANCE_MODULE,
  USDC,
  PERP_TEST_USDC,
  KOVAN_TESTNET_ID,
  PERP_SET_TOKEN_NAME,
  PERP_SET_TOKEN_SYMBOL,
} from "../deployments/constants/000_perpSetToken";

let owner: Account;
let instanceGetter: InstanceGetter;

const CURRENT_STAGE = getCurrentStage(__filename);

/**
 * NOTE: This script creates a PerpV2LeverageModule enabled SetToken. It's a convenient way to
 * to deploy, initialize and issue a SetToken which can be managed with the PerpLeverageStrategyExtension.
 *
 * Perpetual Protocol has a fully deployed system on Optimistic Kovan. We *strongly* recommend you
 * deploy there first (using `yarn deploy:kovan`) and do extensive testing of your token before
 * deploying to Optimism mainnet.
 */
const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {
  const contexts = ["development"];

  const { deployer, rawTx, networkConstant } = await prepareDeployment(hre);
  const networkId = await getNetworkId();

  // Configure: Script is skipped by default except for testing
  const SHOULD_SKIP = true;
  if (SHOULD_SKIP && !contexts.includes(networkConstant)) return;

  [owner] = await getAccounts();
  instanceGetter = new InstanceGetter(owner.wallet);

  const setTokenCreatorAddress = await findDependency(SET_TOKEN_CREATOR);
  const setTokenCreatorInstance = await instanceGetter.getSetTokenCreator(setTokenCreatorAddress);

  // Perpetual Protocol has a fully deployed system on Optimistic Kovan. You can get the
  // kovan test USDC it uses from faucet at: https://kovan.optifaucet.com/
  const usdcTokenAddress = (networkId === KOVAN_TESTNET_ID)
    ? await findDependency(PERP_TEST_USDC)
    : await findDependency(USDC);

  // If testing, impersonate a Uniswap USDC pool and transfer USDC to the deployer
  if (networkConstant === "development") {
    const uniUSDCPoolAddress = "0x7f5c764cbc14f9669b88837ca1490cca17c31607";
    await hre.network.provider.send("hardhat_impersonateAccount", [uniUSDCPoolAddress]);
    const uniSigner = await hre.ethers.getSigner(uniUSDCPoolAddress);
    const usdcTokenInstance = await instanceGetter.getTokenMock(usdcTokenAddress);
    await usdcTokenInstance.connect(uniSigner).transfer(deployer, usdc(500));
  }

  const perpV2LibraryV2Address = await findDependency(PERPV2_LIBRARY_V2);
  const positionV2LibAddress = await findDependency(POSITION_V2);
  const perpV2PositionsLibAddress = await findDependency(PERP_V2_POSITIONS);
  const perpV2LeverageModuleAddress = await findDependency(PERPV2_LEVERAGE_MODULE);
  const slippageIssuanceModuleAddress = await findDependency(SLIPPAGE_ISSUANCE_MODULE);
  const streamingFeeModuleAddress = await findDependency(STREAMING_FEE_MODULE);
  let perpSetTokenAddress = await findDependency(CONTRACT_NAMES.PERP_SET_TOKEN);

  // ===============
  // Deploy SetToken
  // ===============
  // NOTE: SetToken contracts automatically verify on optimistic.etherscan. If you run
  // `yarn etherscan:<network> for this deployment, you'll receive an error about being unable to
  // find the correct bytecode in the project's artifacts. This can be safely ignored - we deploy
  // this contract from built artifacts in an npm dependency and Hardhat's tooling doesn't accomodate
  // this use-case. To avoid seeing this error, set the `verified` key in deployments/outputs/<network>
  // for this SetToken to `true` after deploying.

  // Configure: This quantity is the initial cost-to-issue of the SetToken ($100) and
  // establishes a USDC <amount> units default position for the token's initial issuance.
  const INITIAL_DEPOSIT_AMOUNT = usdc(100);

  if (perpSetTokenAddress === "") {
    const constructorArgs = [
      [usdcTokenAddress],
      [INITIAL_DEPOSIT_AMOUNT],
      [
        perpV2LeverageModuleAddress,
        slippageIssuanceModuleAddress,
        streamingFeeModuleAddress,
      ],
      deployer,
      PERP_SET_TOKEN_NAME,
      PERP_SET_TOKEN_SYMBOL,
    ];

    // @ts-ignore
    const setTokenCreateData = setTokenCreatorInstance
      .interface
      .encodeFunctionData("create", constructorArgs);

    const createTransaction: any = await rawTx({
      from: deployer,
      to: setTokenCreatorInstance.address,
      data: setTokenCreateData,
      log: true,
    });

    // Give optimism some time to index logs
    await new Promise(resolve => setTimeout(() => resolve(true), 10_000));

    perpSetTokenAddress = await new ProtocolUtils(hre.ethers.provider).getCreatedSetTokenAddress(
      createTransaction.transactionHash,
      createTransaction.blockNumber
    );

    // Splice in controller address added to SetToken constructor args by the SetTokenCreator
    const controllerAddress = await getContractAddress("Controller");
    constructorArgs.splice(3, 0, controllerAddress);

    await saveContractDeployment({
      name: CONTRACT_NAMES.PERP_SET_TOKEN,
      contractAddress: perpSetTokenAddress,
      id: createTransaction.transactionHash,
      description: "Created PerpSetToken",
      constructorArgs,
    });
    console.log("> PerpSetToken created:", perpSetTokenAddress);

    const perpSetTokenInstance = await instanceGetter.getSetToken(perpSetTokenAddress);

    // ==========================
    // Initialize Issuance Module
    // ==========================
    const isSlippageIssuanceModuleInitialized = await perpSetTokenInstance
      .isInitializedModule(slippageIssuanceModuleAddress);

    if (!isSlippageIssuanceModuleInitialized) {
      // Initialize Set on module
      const slippageIssuanceModuleInstance = await instanceGetter
        .getSlippageIssuanceModule(slippageIssuanceModuleAddress);

      const slippageIssuanceModuleInitializeData = slippageIssuanceModuleInstance
        .interface
        .encodeFunctionData("initialize", [
          perpSetTokenAddress,
          ether(0.02),  // Max fee
          ether(0.005), // Issue fee
          ether(0.005), // Redeem fee
          owner.address,
          ADDRESS_ZERO,
        ]);

      const initializeSlippageIssuanceModule: any = await rawTx({
        from: deployer,
        to: slippageIssuanceModuleInstance.address,
        data: slippageIssuanceModuleInitializeData,
        log: true,
      });

      await writeTransactionToOutputs(
        initializeSlippageIssuanceModule.transactionHash,
        "Initialized TestPerp Set on SlippageIssuanceModule"
      );
    }
    console.log("> Perp SetToken initialized on SlippageIssuanceModule");

    // ==============================
    // Initialize StreamingFee Module
    // ==============================
    const isStreamingFeeModuleInitialized = await perpSetTokenInstance.
      isInitializedModule(streamingFeeModuleAddress);

    if (!isStreamingFeeModuleInitialized) {
      const streamingFeeModuleInstance = await instanceGetter.getStreamingFeeModule(streamingFeeModuleAddress);
      const streamingFeeInitializeData = streamingFeeModuleInstance.interface.encodeFunctionData("initialize", [
        perpSetTokenAddress,
        {
          feeRecipient: deployer,
          maxStreamingFeePercentage: ether(0.05), // 5% max fee
          streamingFeePercentage: ether(0.0095),  // 0.95% streaming fee
          lastStreamingFeeTimestamp: ZERO,
        },
      ]);
      const initializeStreamingFeeModule: any = await rawTx({
        from: deployer,
        to: streamingFeeModuleInstance.address,
        data: streamingFeeInitializeData,
        log: true,
      });
      await writeTransactionToOutputs(
        initializeStreamingFeeModule.transactionHash,
        "Initialized PerpSetToken on StreamingFeeModule"
      );
    }
    console.log("> Perp SetToken initialized on StreamingFeeModule");

    // =========================================
    // Initialize SetToken on PerpLeverageModule
    // =========================================
    const perpV2LeverageModuleInstance = await instanceGetter
      .getPerpV2LeverageModuleV2(
        positionV2LibAddress,
        perpV2LibraryV2Address,
        perpV2PositionsLibAddress,
        perpV2LeverageModuleAddress
      );

    const isPerpLeveragModuleInitialized = await perpSetTokenInstance.
      isInitializedModule(perpV2LeverageModuleAddress);

    if (!isPerpLeveragModuleInitialized) {
      const initializeOnPerpModuleData = perpV2LeverageModuleInstance
        .interface
        .encodeFunctionData(
          "initialize",
          [
            perpSetTokenAddress,
          ]
        );

      const initializeOnPerpModule: any = await rawTx({
        from: deployer,
        to: perpV2LeverageModuleInstance.address,
        data: initializeOnPerpModuleData,
        log: true,
      });

      await writeTransactionToOutputs(
        initializeOnPerpModule.transactionHash,
        "Initialized Perp SetToken on PerpV2LeverageModule"
      );

      console.log("> Perp SetToken initialized on PerpV2LeverageModule");
    }

    // =======================================
    // Approve USDC for SlippageIssuanceModule
    // =======================================
    const usdcInstance = await instanceGetter.getTokenMock(usdcTokenAddress);
    const allowance = await usdcInstance.allowance(deployer, slippageIssuanceModuleAddress);

    if (allowance.eq(0)) {
      await usdcInstance.approve(slippageIssuanceModuleAddress, MAX_UINT_256);
      console.log("> Approved ", USDC, "to SlippageIssuanceModule");
    }

    // ================
    // Issue 1 SetToken
    // ================

    // This transaction requires that your deployer account has 100 USDC to issue a SetToken. It will
    // set up a 100 usdc units default USDC position in the SetToken that you'll be able to  deposit
    // into the Perp protocol using the PerpV2LeverageModule's `deposit` method.
    //
    // SetToken total supply will be 1 (e.g 1 * 1e18) after issuance
    //
    // For more info about next steps, see the documentation at:
    // https://docs.tokensets.com/developers/guides-and-tutorials/protocol/trading/via-perpetual-protocol
    const slippageIssuanceModuleInstance = await instanceGetter
      .getSlippageIssuanceModule(slippageIssuanceModuleAddress);

    const issueData = slippageIssuanceModuleInstance
      .interface
      .encodeFunctionData(
        "issue",
        [
          perpSetTokenAddress,
          ether(1),
          owner.address,
        ]
      );

    const issue: any = await rawTx({
      from: deployer,
      to: slippageIssuanceModuleInstance.address,
      data: issueData,
      log: true,
    });

    await writeTransactionToOutputs(
      issue.transactionHash,
      "Issued 1 Perp SetToken via SlippageIssuanceModule"
    );

    console.log("> Issued 1 Perp SetToken via SlippageIssuanceModule");
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;