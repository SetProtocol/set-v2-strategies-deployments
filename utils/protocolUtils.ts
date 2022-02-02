import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";

import { ethers } from "ethers";

export class ProtocolUtils {
  public _provider: Web3Provider | JsonRpcProvider;

  constructor(_provider: Web3Provider | JsonRpcProvider) {
    this._provider = _provider;
  }

  // SetTokens are factory issued. This method grabs the SetToken contract address by querying chain
  // for a SetTokenCreated event at a specific block number.
  public async getCreatedSetTokenAddress (txnHash: string | undefined, blockNumber?: number): Promise<string> {
    if (!txnHash) {
      throw new Error("Invalid transaction hash");
    }

    const blockParam: string | number = (blockNumber === undefined) ? "latest" : blockNumber;

    const abi = ["event SetTokenCreated(address indexed _setToken, address _manager, string _name, string _symbol)"];
    const iface = new ethers.utils.Interface(abi);

    const topic = ethers.utils.id("SetTokenCreated(address,address,string,string)");
    const logs = await this._provider.getLogs({
      fromBlock: blockParam,
      toBlock: blockParam,
      topics: [topic],
    });

    const parsed = iface.parseLog(logs[logs.length - 1]);
    return parsed.args._setToken;
  }
}
