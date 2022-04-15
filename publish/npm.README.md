# set-v2-strategies-deployments

This repository contains contract addresses for all [set-v2-strategies][1] staging and production deployments.

SetProtocolV2 Strategies currently deploys to three networks:
+ Ethereum
+ Optimism
+ Polygon

## Install

```
yarn add @setprotocol/set-v2-strategies-deployments
```

## Usage

The package consists of `.json` files located and usable as below:

```
deployments/<network_name>/production.json
deployments/<network_name>/staging.json
```

```js
> const production = require("@setprotocol/set-v2-strategies-deployments/deployments/ethereum/production");
> production.addresses
{
  "ManagerCore": "0x7a397B3ed39E84C6181e47309CE940574290f4e7",
  "DelegatedManagerFactory": "0x5132044c71b98315bDD5D8E6900bcf93EB2EbeC0",
  "IssuanceExtension": "0x05C5c57E5E75FC8EaD83FE06ebe4aCc471Fb2948",
  ...
}
```


[1]: https://github.com/SetProtocol/set-v2-strategies
