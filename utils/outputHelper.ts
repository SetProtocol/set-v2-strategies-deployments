import fs from "fs-extra";
import * as _ from "lodash";

import path from "path";

require("dotenv").config({ path: "./.env"});

const privateKey: string | undefined = process.env.DEPLOYMENT_PRIVATE_KEY;

const deploymentConstants: string | undefined = process.env.DEPLOYMENT_CONSTANT;
const deploymentNetworkId: number = parseInt(process.env.DEPLOYMENT_NETWORK_ID as any);

export const log = console.log;
export const OUTPUTS_PATH = path.join(process.cwd(), `deployments/outputs/${getDeploymentNetworkKey()}.json`);


export type ContractDeploymentData = {
  id: string;
  name: string;
  description: string;
  contractAddress: string;
  constructorArgs?: any[];
  libraries?: object;
  verified?: boolean;
  timestamp?: number;
  blockNumber?: number;
};

export type DeferredTransactionData = {
  data: string;
  description: string;
  contractName: string;
  params?: any;
};

export function getCurrentStage(fileName: string): number {
  const baseFile = path.basename(fileName);
  const splitStr = baseFile.split("_");

  return Number(splitStr[0]);
}

export async function ensureOutputsFile() {
  await fs.ensureFile(OUTPUTS_PATH);
}

export function getDeploymentNetworkKey(): string {
  return `${deploymentNetworkId}-${deploymentConstants}`;
}

export async function returnOutputs(): Promise<any> {
  return await fs.readJson(OUTPUTS_PATH, { throws: false }) || await returnEmptyNetworkValue();
}

export function getNetworkConstant(): string {
  if (!deploymentConstants) {
    throw new Error("Network constant must be defined");
  }
  return deploymentConstants;
}

export function getNetworkId(): number {
  return deploymentNetworkId;
}

export function getPrivateKey(): string | undefined {
  return privateKey;
}

export async function sortAddresses() {
  const outputs = await returnOutputs();
  const unorderedAddresses = outputs["addresses"];
  const orderedAddresses = {} as any;

  Object.keys(unorderedAddresses).sort().forEach(function(key) {
    orderedAddresses[key] = unorderedAddresses[key];
  });

  outputs["addresses"] = orderedAddresses;

  await fs.outputFile(OUTPUTS_PATH, JSON.stringify(outputs, undefined, 2));
}

export async function findDependency(name: string) {
  const networkDependenciesPath = path.join(process.cwd(), "deployments", "utils", "dependencies.ts");
  const dependencies = (await import(networkDependenciesPath)).default;

  // Use staging dependency addresses for forked development tests
  let networkConstant = getNetworkConstant();

  if (networkConstant === "development") {
    networkConstant = "staging";
  }

  if (dependencies[name] && dependencies[name][getNetworkId()]) {
    return (typeof dependencies[name][getNetworkId()] === "string")
      ? dependencies[name][getNetworkId()]
      : dependencies[name][getNetworkId()][networkConstant];
  }

  return await getContractAddress(name);
}

export async function getContractAddress(name: string) {
  const outputs: any = await returnOutputs();

  return outputs["addresses"][name] || "";
}

export async function getContractCode(name: string, web3: any): Promise<string> {
  const contractAddress = await getContractAddress(name);
  return await web3.eth.getCode(contractAddress);
}

export async function saveDeferredTransactionData(tx: DeferredTransactionData) {
  const outputs: any = await returnOutputs();
  const lastTransactionNumber = getNextTransactionKey(outputs);

  outputs["transactions"][lastTransactionNumber] = {
    id: null,        // eslint-disable-line
    timestamp: null, // eslint-disable-line
    data: tx.data,
    description: tx.description,
    contractName: tx.contractName,
    params: tx.params
  };
  await fs.outputFile(OUTPUTS_PATH, JSON.stringify(outputs, undefined, 2));
}

export async function saveContractDeployment(data: ContractDeploymentData) {
  const contractAddress = await getContractAddress(data.name);

  if (contractAddress === "") {
    const outputs: any = await returnOutputs();
    const lastTransactionNumber = getNextTransactionKey(outputs);
    const timestamp = new Date().getTime();

    outputs["addresses"][data.name] = data.contractAddress;

    outputs["transactions"][lastTransactionNumber] = {
      id: data.id,
      name: data.name,
      timestamp,
      verified: false,
      description: data.description,
      contractAddress: data.contractAddress,
      constructorArgs: data.constructorArgs || [],
      libraries: data.libraries || {},
    };

    await fs.outputFile(OUTPUTS_PATH, JSON.stringify(outputs, undefined, 2));
  }
}

export async function writeContractAndTransactionToOutputs(name: string, value: string, transactionId: string, description: string) {
  const contractAddress = await getContractAddress(name);
  if (contractAddress === "") {
    const outputs: any = await returnOutputs();

    outputs["addresses"][name] = value;
    await fs.outputFile(OUTPUTS_PATH, JSON.stringify(outputs, undefined, 2));

    await writeTransactionToOutputs(transactionId, description);
  }
}

export async function writeTransactionToOutputs(transactionId: string, description: string) {
  const outputs: any = await returnOutputs();

  const lastTransactionNumber = getNextTransactionKey(outputs);
  const currentTimestamp = new Date().getTime();

  outputs["transactions"][lastTransactionNumber] = {
    id: transactionId,
    timestamp: currentTimestamp,
    description: description,
  };
  await fs.outputFile(OUTPUTS_PATH, JSON.stringify(outputs, undefined, 2));
}

export function getNextTransactionKey(outputs: any): number {
  const outputTransactions = Object.keys(outputs["transactions"]);
  const transactionKeys = _.map(outputTransactions, transactionKey => Number(transactionKey));

  if (!transactionKeys.length) {
    return 0;
  }

  return Math.max(...transactionKeys) + 1;
}

export async function removeNetwork(name: string) {
  const outputs: any = await returnOutputs();
  outputs[name] = undefined;
  await fs.outputFile(OUTPUTS_PATH, JSON.stringify(outputs, undefined, 2));
}

export async function writeStateToOutputs(parameter: string, value: any) {
  const outputs: any = await returnOutputs();

  outputs["state"][parameter] = value;
  await fs.outputFile(OUTPUTS_PATH, JSON.stringify(outputs, undefined, 2));
}

async function returnEmptyNetworkValue(): Promise<any> {

  const networkDependenciesPath = path.join(process.cwd(), "deployments", "utils", "dependencies.ts");
  const dependencies = (await import(networkDependenciesPath)).default;

  const networkName = dependencies.HUMAN_FRIENDLY_NAMES[deploymentNetworkId];
  const humanFriendlyName = `${networkName}-${deploymentConstants}`;
  return {
    "state": {
      "network_key": getDeploymentNetworkKey(),
      "human_friendly_name": humanFriendlyName,
      "network_id": deploymentNetworkId,
    },
    "addresses": {},
    "transactions": {},
  };
}

export async function getLastDeploymentStage(): Promise<number> {
  try {
    const output = await returnOutputs();

    return output["state"]["last_deployment_stage"] || 0;
  } catch {
    return 0;
  }
}

export async function isCorrectNetworkId(): Promise<boolean> {
  try {
    const output = await returnOutputs();
    const existingId = output["network_id"];

    if (!existingId) {
      await writeStateToOutputs("network_id", deploymentNetworkId);
      return true;
    }

    return existingId == deploymentNetworkId;
  } catch {
    return true;
  }
}

export async function waitMs(ms: number) {
  await new Promise(r => setTimeout(() => r(true), ms));
}
