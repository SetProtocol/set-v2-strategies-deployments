import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  findDependency,
  getCurrentStage,
  stageAlreadyFinished,
  trackFinishedStage,
} from "@utils/index";

import { DEPENDENCY } from "../deployments/utils/dependencies";
import {ManagerMigrator} from "@utils/managerMigrationUtils";

const {
  BED,
  BED_OPERATOR_V1,
  BED_METHODOLOGIST,
  BED_FEE_EXTENSION_V1
} = DEPENDENCY;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {
  const migrator = new ManagerMigrator(hre.ethers.provider);
  await migrator.initialize(hre);

  const bed = await findDependency(BED);
  const bedOperator = await findDependency(BED_OPERATOR_V1);
  const bedMethodologist = await findDependency(BED_METHODOLOGIST);
  const bedFeeExtension = await findDependency(BED_FEE_EXTENSION_V1);

  await migrator.impersonateMultisigs([bedOperator, bedMethodologist]);

  // Transfer SetToken managership to a multisig. Before this step, methodologist can be added
  // to the operator multisig or a dedicated multisig could be created to manage the transition.
  // Methodologist would sign both sides of this setManager() mutual upgrade tx and be a
  // co-signer for all other txs.

  // Assume for the moment operator will be the transitionalManager and also have the
  // DelegatedManager operator role.
  const transitionalManager = bedOperator;
  const delegatedOperators = [bedOperator];

  await migrator.transferSetToTransitionalManager(
    transitionalManager,
    bed
  );

  await migrator.createDelegatedManager(
    transitionalManager,
    bed,
    bedOperator,
    bedMethodologist,
    delegatedOperators
  );

  // Cache DelegatedManager address (we need this for the final transfer)
  const delegatedManager = await migrator.getDelegatedManagerAddress(bed);

  // Initializes DelegatedManager and inherits existing FeeSplitExtension settings for
  // `operatorFeeSplit` and `operatorFeeRecipient`. In practice, executors will need to fetch
  // the new delegated manager address by querying the factory before running factory.initialize()
  await migrator.initializeManager(
    transitionalManager,
    bedFeeExtension,
    bed
  );

  await migrator.transferSetToDelegatedManager(
    transitionalManager,
    delegatedManager,
    bed
  );
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;