import fs from "fs-extra";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import {
  returnOutputs,
  waitMs,
  getDeploymentNetworkKey,
  ContractDeploymentData as Data,
  OUTPUTS_PATH,
  log
} from "../utils/outputHelper";

const help = "Submits all unverified contracts to Etherscan for a given deployment network.\n" +
             "Uses settings in '.env': <DEPLOYMENT_NETWORK_ID>, <DEPLOYMENT_CONSTANT> " +
             "which select the relevant deployments/output file (ex: 1-staging.json).";

task("set:etherscan:verify", help).setAction(async (_, hre: HRE) => {
  const outputs = await returnOutputs();

  log(`> Etherscan verifying new deployment(s) for: ${getDeploymentNetworkKey()}`);

  for (const [index, deployment] of <[string, Data][]>Object.entries(outputs.transactions)) {
    if (deployment.contractAddress && deployment.verified === false) {
      try {

        await hre.run("verify:verify", {
          address: deployment.contractAddress,
          constructorArguments: deployment.constructorArgs,
          libraries: deployment.libraries,
        });

        deployment.verified = true;
        outputs.transactions[index] = deployment;

      // Continue on failure
      } catch (err) {
        log(`Errored on ${deployment.name} with:`);
        log(err);
        log();
      }
      // Etherscan rate limit is 5 API calls/sec
      await waitMs(250);
    }
  }

  await fs.outputFile(OUTPUTS_PATH, JSON.stringify(outputs, undefined, 2));
});

exports = {};


