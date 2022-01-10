import path from "path";
import chalk from "chalk";
import { task } from "hardhat/config";

const log = console.log;
const shell = require("shelljs");

// Text
const help = "Utility for generating files needed for a new deployment. Automatically prefixes\n" +
             "files with the next number in the deployment sequence. Creates:\n\n" +
             "  > deploy/<num>_<deployment_name>.ts\n" +
             "  > deployments/constants/<num>_<deployment_name>.ts\n" +
             "  > test/deploys/<num>_<deployment_name>.spec.ts\n\n" +
             "USAGE: yarn create:deployment <deployment_name>\n";

const successMsg = chalk.green("New deployment files at:");

const missingArgError = chalk.red(
  "You must provide a deployment name. Ex: `yarn create:deployment example_adapter`\n"
);

const overwriteError = chalk.red(
  "The suggested deployment name already has files associated with it. See: "
);

// Task
task("set:utils:create:deployment", "help")
  .addOptionalPositionalParam("deploymentName", help)
  .setAction(async taskArgs => {

    // Check that a deployment name was provided
    if (taskArgs.deploymentName === undefined) {
      log(missingArgError);
      log(help);
      return;
    }

    // Get the next number in the sequence if deploymentName is un-prefixed
    let isPrefixed = true;
    let sequenceNumber = parseInt(taskArgs.deploymentName.slice(0, 3));

    if ( isNaN(sequenceNumber) ) {
      isPrefixed = false;
      sequenceNumber = 0;
      const existingDeploymentFiles = shell.ls(path.join(process.cwd(), "deploy"));

      for (const fileName of existingDeploymentFiles) {
        const num = parseInt(fileName.slice(0, 3));
        if (num > sequenceNumber) {
          sequenceNumber = num;
        }
      }

      sequenceNumber++;
    }

    // Normalize deploymentName arg
    let prefix;

    if (sequenceNumber < 10) {
      prefix = "00" + sequenceNumber;
    } else if (sequenceNumber < 100 ) {
      prefix = "0" + sequenceNumber;
    } else {
      prefix = sequenceNumber.toString();
    }

    let fileName: string = (taskArgs.deploymentName.endsWith(".ts"))
      ? taskArgs.deploymentName.split(".ts")[0]
      : taskArgs.deploymentName;

    fileName = (isPrefixed)
      ? fileName
      : `${prefix}_${fileName}`;

    // Create paths
    const filePaths = [
      path.join(process.cwd(), "deploy", `${fileName}.ts`),
      path.join(process.cwd(), "deployments", "constants", `${fileName}.ts`),
      path.join(process.cwd(), "test", "deploys", `${fileName}.spec.ts`),
    ];

    // Make sure nothing's being overwritten
    for (const filePath of filePaths) {
      if (shell.test("-e", filePath)) {
        log(overwriteError + filePath);
        process.exit(1);
      }
    }

    // Create files
    shell.touch(...filePaths);

    // List new files
    log(successMsg);
    for (const filePath of filePaths) {
      log(`> ${filePath}`);
    }
  });

