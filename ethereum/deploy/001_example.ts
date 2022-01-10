import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  getCurrentStage,
} from "@utils/outputHelper";

import { stageAlreadyFinished, trackFinishedStage, prepareDeployment } from "@utils/deploys/deployUtils";

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {
  await prepareDeployment(hre);
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;
