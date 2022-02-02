# set-v2-strategies-deployments

This repository manages SetProtocol V2 Strategies contract deployments using the [hardhat-deploy plugin][22].
Each deployment is tracked and recorded by network in a [deployments/outputs][23] file.

**All proposed deployments should:**
+ deploy to HardhatEVM
+ have unit tests which check the correctness of state variables set in the constructor
+ be deployed to a testnet have its contract code verified on a block explorer like Etherscan

#### Chains

SetProtocol deploys to multiple chains and manages each execution environment in its own folder.

There are dedicated environments for:
 + Ethereum (mainnet, kovan)
 + Polygon (mainnet-polygon, mumbai, goerli)
 + Optimism (mainnet, kovan)
 + Arbitrum (mainnet, rinkeby)
 + Avalanche (mainnet, fuji)

To run commands like `test`, `deploy`, navigate to the folder for the chain you're working with.


## Install

Run these commands in the project root.
```
cp .env.default .env
yarn
cd <chain_folder> // e.g ethereum, polygon, etc
```

## Test (deployment)

We use the hardhat network forking feature to simulate and test deployments. You'll need a valid
[alchemy.com][200] project id to run these.
```
yarn clean-dev-deployment
yarn deploy:local
```

## Test (unit)
```
yarn test
```

## Example Testnet Deployment (Kovan)

Fill in the following fields in your `.env` file:

+ `KOVAN_DEPLOY_PRIVATE_KEY`: An automated kovan faucet [is here][24], or at [myCrypto, here][27]
+ `INFURA_TOKEN`: An Infura projectID. Available with an account at [infura.io][25]
+ `ETHERSCAN_API_KEY`: Available with an account from [etherscan.io/api][26]

**Run:**
```
yarn deploy:kovan
yarn etherscan:kovan
```

(If etherscan fails, see the [Etherscan](#etherscan-verification) section below).

## Usage Guide

New deployments have at least two (and sometimes 3) phases:

| Phase | Pull Request / Op | Pre-requisites |
| ---- | ---- | ----|
| 1 | Deployment script PR with tests | Code merged at set-v2-strategies & published to npm |
| 2 | Executed deployment PR | Phase 1 complete |
| 3 | Activate new components via Gnosis multisig | Phase 2 complete & deployment is production |

### Deployment scripts

Create the new files you'll need by running the `create:deployment` command.

This will generate files numbered for the latest stage in the deploy, deployments, and test folders.

```sh
$ yarn create:deployment my_deployment_name

New deployment files at:
> .../ethereum/deploy/001_my_deployment_name.ts
> .../ethereum/deployments/constants/001_my_deployment_name.ts
> .../ethereum/test/deploys/001_my_deployment_name.spec.ts
```

Then, find the **most recent** scripts and tests which are suitable templates for your deployment
and copy/paste them into the new files, adapting as necessary.

**:bulb: Pro Tips :bulb:**:

+ Verify new contracts on Kovan to catch any contract verification issues early in the process.
+ Useful helpers can be found in [outputHelper.ts][30] and [deployUtils.ts][31]
+ Addresses for on-chain dependencies can be found in [dependencies.ts][32]


### Executing Deployments

| Step | Action | Command |
| ---- | ---- | ---- |
| 1 | Checkout master, `git pull`, and run `yarn` ||
| 2 | Checkout a new branch | `git checkout -b alex/deploy_....` |
| 3 | Deploy to `staging_mainnet` | `yarn deploy:staging_mainnet` |
| 4 | Verify deployment on Etherscan | `yarn etherscan:staging_mainnet`
| 5 | Check contracts' read/write endpoints in Etherscan's UI |  |
| 6 | Deploy to `production` | `yarn deploy:production` |
| 7 | Verify deployment on Etherscan | `yarn etherscan:production` |
| 8 | Commit automated changes made to outputs logs | |
| 9 | Open PR documenting the addresses of new components | |


### Multisig Operations (deferred transactions)

When modules, integrations, and price oracles are added to Set in production, @asoong and @felix2feng
enable them via multisig with Gnosis Safe wallets online.

Deployment scripts should save the tx data generated for these deferred transactions using a flow
similar to that used in [deployUtils#addIntegrationToRegistry][28].

**Resources:**
+ [Master list of pending and completed multisig operations][29] (only accessible to SetProtocol engineers)
+ [Multisig transaction utilities](#multisig-transaction-utilities) in this repo.


[22]: https://github.com/wighawag/hardhat-deploy
[23]: https://github.com/SetProtocol/index-deployments/tree/master/deployments/outputs
[24]: https://faucet.kovan.network/
[25]: https://infura.io/
[26]: https://etherscan.io/apis
[27]: https://app.mycrypto.com/faucet
[28]: https://github.com/SetProtocol/set-v2-strategies-deployments/blob/325cb49034642767519f969046a3dc8e54b1dd7c/deployments/utils/deployUtils.ts#L83-L100
[29]: https://docs.google.com/spreadsheets/d/1B00zmmBm0SLuYePNgeKTGvXzuRewQ6ymJfm0hQ2SUs4/edit#gid=1026270302
[30]: https://github.com/SetProtocol/set-v2-strategies-deployments/blob/master/deployments/utils/outputHelper.ts
[31]: https://github.com/SetProtocol/set-v2-strategies-deployments/blob/master/deployments/utils/deployUtils.ts
[32]: https://github.com/SetProtocol/set-v2-strategies-deployments/blob/master/deployments/utils/dependencies.ts

## Chain resources

#### Ethereum

+ [Etherscan API keys][26]
+ [Infura][25] (for project ids)
+ Kovan faucets:
  + [faucet.kovan.network][24]
  + [myCrypto][27]

#### Polygon

+ [Polygon/matic docs][33]
+ [Mumbai faucet][34]
+ [Goerli faucet][35]
+ [Matic mainnet bridge wallet][37] (for moving mainnet funds w/ Metamask, WalletConnect)

[33]: https://docs.matic.network/docs/develop/getting-started
[34]: https://faucet.matic.network/
[35]: https://faucet.goerli.mudit.blog/
[37]: https://wallet.matic.network/login?next=%2Fbridge%2F

## Etherscan verification

Set `ETHERSCAN_API_KEY=8UC6MJ3E5R2AXIHFZQ6JNU2U5QCV1EZGX5Y` in `.env`

After deploying, run the command for your network:
```
yarn etherscan:kovan
yarn etherscan:staging_mainnet
yarn etherscan:production
```

**When Etherscan fails...**

Verification may fail because of [solidity issue 9573][1] which causes Etherscan
to generate different bytecode from a minimized contract set than what was generated locally with
all contracts in the project. The error message says:

```
Compiling your contract excluding unrelated contracts did not produce identical bytecode.
...
NomicLabsHardhatPluginError: Source code exceeds max accepted (500k chars) length
```

To get around this, use the `compile:one` task to compile your target contract in isolation.

In a deployment script, right before the problematic contract is deployed:
```js
// Compile in isolation for Etherscan verification bug
await bre.run("set:compile:one", { contractName: "GeneralIndexModule"});
```

... or a the command line:
```sh
yarn compile:one GeneralIndexModule
yarn deploy:kovan
yarn etherscan:kovan
```

[1]: https://github.com/ethereum/solidity/issues/9573#issuecomment-721632715

## Deployment creation utility

#### `yarn create:deployment`

The create:deployment command creates standard files necessary for each new deployment. It
takes a deployment name as an argument and automatically prefixes it with the next increment of the
deployment sequence.

```sh
$ yarn create:deployment my_deployment_name

New deployment files at:
> .../ethereum/deploy/001_my_deployment_name.ts
> .../ethereum/deployments/constants/001_my_deployment_name.ts
> .../ethereum/test/deploys/001_my_deployment_name.spec.ts
```

[200]: https://www.alchemy.com/