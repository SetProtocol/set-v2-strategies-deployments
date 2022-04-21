
export default {
  // TOKENS
  // Source:
  USDC: {
    1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    10: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
    69: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
  },
  WETH: {
    1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    10: "0x4200000000000000000000000000000000000006",
    69: "0x4200000000000000000000000000000000000006",
  },
  WBTC: {
    1: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    10: "0x68f180fcce6836688e9084f035309e29bf0a2095",
    69: "",
  },

  // SetTokens
  TEST_PERP_TOKEN: {
    10: {
      staging: "0x6Fbe275b73b6f4950FEd4791d3983894825E9d45",
      production: ""
    },
    69: "0x6027c4dcFE97fa079D639bBDD018E95dDc1d9c65"
  },
  TEST_BASIS_TOKEN: {
    10: {
      staging: "0x127B97587Df93BcbDF66b30A53654D6B9a5E183B",
      production: ""
    },
    69: "0x93910D1D112AEA86E20c998948897b0cd37B3Ed9"
  },

  // Prod SetTokens
  MNY_ETH_TOKEN: {
    10: {
      staging: "0x93910D1D112AEA86E20c998948897b0cd37B3Ed9",    // dummy address
      production: "0x0Be27c140f9Bdad3474bEaFf0A413EC7e19e9B93"
    },
    69: ""
  },

  // PerpV2 virtual tokens
  V_ETH: {
    10: "0x8C835DFaA34e2AE61775e80EE29E2c724c6AE2BB",
    69: "0x099FaDE6D13401c4f9742db09ae827E434FB4C30"
  },
  V_BTC: {
    10: "0x86f1e0420c26a858fc203A3645dD1A36868F18e5",
    69: "0x362a09eb7d30ecb86de395291f9d26931baabc1d"
  },
  V_USD: {
    10: "0xC84Da6c8ec7A57cD10B939E79eaF9d2D17834E04",
    69: "0xd52d4175f937b965de49e6c24e081eee6dae5645"
  },

  // Need sushi analytics...
  WETH_USDC_SUSHI_PAIR: {
    10: "",
    69: "",
  },
  WETH_WBTC_SUSHI_PAIR: {
    10: "",
    69: "",
  },

  // Exchanges

  UNISWAP_V3_ROUTER: {
    10: "0xe592427a0aece92de3edee1f18e0157c05861564",
    69: "0xe592427a0aece92de3edee1f18e0157c05861564",
  },
  UNISWAP_V3_QUOTER: {
    10: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    69: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
  },

  // Source: https://github.com/sushiswap/sushiswap/tree/canary/deployments/optimism
  SUSHISWAP_ROUTER: {
    10: "", // NOT DEPLOYED
    69: "", // NOT DEPLOYED
  },

  SUSHISWAP_FACTORY: {
    10: "", // NOT DEPLOYED
    69: "", // NOT DEPLOYED
  },

  // Source:
  // https://github.com/0xProject/protocol/blob/development/packages/contract-addresses/addresses.json#L493
  ZERO_EX_EXCHANGE: {
    10: "0xDEF1ABE32c034e558Cdd535791643C58a13aCC10",
    69: "0xDEF1ABE32c034e558Cdd535791643C58a13aCC10", // Fake
  },

  // Chainlink Oracles

  // Source: https://docs.chain.link/docs/optimism-price-feeds/
  //
  // These are USD oracles returning 8 decimals
  BTC_CHAINLINK_ORACLE: {
    420: "0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6",
    10: "0xc326371d4D866C6Ff522E69298e36Fe75797D358",
    69: "0x81AE7F8fF54070C52f0eB4EB5b8890e1506AA4f4",
  },
  ETH_CHAINLINK_ORACLE: {
    420: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    10: "0xA969bEB73d918f6100163Cd0fba3C586C269bee1",
    // This oracle is manipulatable, it is not reading from an actual data source
    69: "0xB928Cd8fb71a54320a4e878743c2d89E7bE19D98",
  },
  LINK_CHAINLINK_ORACLE:  {
    420: "0x0A6513e40db6EB1b165753AD52E80663aeA50545",
    10: "0x74d6B50283AC1D651f9Afdc33521e4c1E3332b78",
    69: "0xb37aA79EBc31B93864Bff2d5390b385bE482897b",
  },
  USDC_CHAINLINK_ORACLE: {
    10: "0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3",
    // This oracle is manipulatable, it is not reading from an actual data source
    69: "0x64E39114ee9F12c15f565ce39A8FC60061e1ED70"
  },
  // PerpV2
  // Source: perp-lushan/metadata/<network>.json at commit: 337df9f (v1.0.2)
  // These are OZ upgradeability proxy contracts
  PERPV2_ACCOUNT_BALANCE: {
    420: "",
    10: "0xA7f3FC32043757039d5e13d790EE43edBcBa8b7c",
    69: "0x594ADf28b465612DB033C1aEF4bd19972343934D",
  },
  PERPV2_CLEARINGHOUSE_CONFIG: {
    420: "",
    10: "0xA4c817a425D3443BAf610CA614c8B11688a288Fb",
    69: "0x22DdF6f4B1cd825324C6f96897c4040de9A1e1F4",
  },
  PERPV2_CLEARINGHOUSE: {
    420: "",
    10: "0x82ac2CE43e33683c58BE4cDc40975E73aA50f459",
    69: "0xf10288Fd8d778F2880793C1CacCBF02206649802",
  },
  PERPV2_EXCHANGE: {
    420: "",
    10: "0xBd7a3B7DbEb096F0B832Cf467B94b091f30C34ec",
    69: "0x2477b99767b81C4b8abFe7056B4c7632aaB38463",
  },
  PERPV2_INSURANCE_FUND: {
    420: "",
    10: "0x1C9a192DF3936cBF093d8afDc352718bCF834EB6",
    69: "0xfdDE7D93230200CD54ba2a35981a8e826cd1489f",
  },
  PERPV2_MARKET_REGISTRY: {
    420: "",
    10: "0xd5820eE0F55205f6cdE8BB0647072143b3060067",
    69: "0x51705d391e0d01fA684366407704De0856E4dBaB",
  },
  PERPV2_VAULT: {
    420: "",
    10: "0xAD7b4C162707E0B2b5f6fdDbD3f8538A5fbA0d60",
    69: "0xB0ff090d04c268ABb26450ba749f0497EFA9Bb7C",
  },

  // PerpV2 uses both Chainlink oracles and Band oracles. All thier oracles have the same interface
  // which is different from Chainlink oracles.
  ETHUSD_PERP_CHAINLINK_ORACLE: {
    10: "0xA36fAF16f31c12285467b1973ee8Fa144ED4d846",
    // 69: "0xfAb3Bc6674a38cA766083838E0eba7bB3Ef96177",
    69: "0xF3C3a94E8e4F3A0c86A950cd619bF09A1E41eBE9"    // mock oracle
  },

  // This address is used for USDC in PerpV2LeverageModule kovan testing. The `69` address is a
  // Perp issued token mock, available from a faucet at: https://kovan.optifaucet.com/
  // Address Source: perp-lushan/deployments at commit: 8bb6bf5
  PERP_TEST_USDC: {
    69: "0x3e22e37Cb472c872B5dE121134cFD1B57Ef06560",
  },

  // System Contracts
  // SetProtocol System
  CONTROLLER: {
    10: {
      staging: "0x719E5B865dE407bf38647C1625D193E0CE42111D",
      production: "0x84D5657347cC2beD0A4D6a82c0A6f3bE1a021cc6"
    },
    69: "0xAB514406F9598C3a79fb047478C7DfB6f38f2684",
  },
  SET_TOKEN_CREATOR: {
    10: {
      staging: "0xCF786472d37f557A80fE6daFF6f2672bfDa728a3",
      production: "0x0bc84D31f11D90156c30B4f19509Ede969A0B840"
    },
    69: "0x1eAF9C71AaDD5339D088eF36bF383f909a0c9780",
  },
  INTEGRATION_REGISTRY: {
    10: {
      staging: "0x14099863F0B6490759f9D8bC5653CF52b7eF38eb",
      production: "0xBc587E41ad8F218E49874D5ca62E5debDE59aaB5"
    },
    69: "0xf620837d57ed0231194eB7F6776e21c6145c7cC1",
  },
  ISSUANCE_MODULE: {
    10: {
      staging: "0xeCdCc6181f17418efE422D5218D4cc63ad8c5c73",
      production: "0x9BBfCA4D9ECdc53F56290442d85c8e55131dAf00"
    },
    69: "0x7853dD7De469638CA26bC9b6f343820be97E5faE",
  },
  DEBT_ISSUANCE_MODULE_V2: {
    10: {
      staging: "0x8ebe03a1963901F6E1680A6234643Cc80dE2222F",
      production: "0xda6D2Da01b7141Ba3232025DC45F192eAE5569DA"
    },
    69: "0x9e3604A29bED5C7F2fF5715390F77EC41d5EeA28",
  },
  TRADE_MODULE: {
    10: {
      staging: "0x4F70287526ea9Ba7e799D616ea86635CdAf0de4F",
      production: "0x7215f38011C3e4058Ca3cF7d2b99033016EeFBD8"
    },
    69: "0x0a18Ad43a9dc991dB9401ee7aC5AAD0A3b219159",
  },
  STREAMING_FEE_MODULE: {
    10: {
      staging: "0x2f8FF0546a478DF380f975cA035B95DF82377721",
      production: "0x6a7aE5124677314dc32C5ba3004CbFC9c7Febff0"
    },
    69: "0xb2812842C176bAf83EcD8e4534A9F4A93e93017E",
  },
  PERPV2_LIBRARY: {
    10: {
      staging: "0x2f8FF0546a478DF380f975cA035B95DF82377721",
      production: "0x4f60F85B512367aCbc23E28a31D1D47a73941D82"
    },
    69: "0x0766894369D568da332619A4368f16eF52D4C47B"
  },
  SLIPPAGE_ISSUANCE_MODULE: {
    10: {
      staging: "0xf04ff1487BB27fA6A83F6276a55aE17Eb8B3C581",
      production: "0x1db929398958082d2080AA1B501e460503f60467"
    },
    69: "0x12951b9Eaa200237f9080C95AD93Cc74c9d9Bd45"
  },
  PERPV2_LEVERAGE_MODULE: {
    10: {
      staging: "0x2f8FF0546a478DF380f975cA035B95DF82377721",
      production: "0xf860f90E1F55e3528682E18850612cBb45BBF1bC"
    },
    69: "0x6169c62e1aaE2D56a2Dc184514e8b515Ff6F1d9e"
  },
  PERPV2_BASIS_TRADING_MODULE: {
    10: {
      staging: "0x02318dd7821a8B9395D616071c1d3573C5886c02",
      production: "0x2C229EE3aD3fdC0e581d51BaA6b6f45CC9A6Ca39"
    },
    69: "0x5aAd2270a04976e66aA6C4F4d3d9E95e06f45542"
  },

  // Source: deployment metadata from npm published: @perp/curie-periphery v1.0.2
  // Repo is not public or privately shared with Set
  PERPV2_QUOTER: {
    420: "",
    10: "0xf92C0Eb708b5182Ed2288f21D36338f83F72714f",
    69: "0x11ff95039A3171dc4c7A03168D576ffC466C6a67",
  },

  // Admin
  MULTI_SIG_OWNER: {
    10: "0x6765852659B204275B359Fe462F11840bcBF263d",
  },
  HUMAN_FRIENDLY_NAMES: {
    420: "test-rpc",
    10: "optimism-mainnet",
    69: "optimism-kovan",
  },
} as any;

export const DEPENDENCY = {
  // Tokens
  SUSHI: "SUSHI",
  WBTC: "WBTC",
  WETH: "WETH",
  USDC: "USDC",
  PERP_TEST_USDC: "PERP_TEST_USDC",

  // SetTokens
  TEST_PERP_TOKEN: "TEST_PERP_TOKEN",
  TEST_BASIS_TOKEN: "TEST_BASIS_TOKEN",

  // Prod SetTokens
  MNY_ETH_TOKEN: "MNY_ETH_TOKEN",

  // PerpV2 virtual tokens
  V_ETH: "V_ETH",
  V_BTC: "V_BTC",
  V_USD: "V_USD",

  // External Protocols
  WETH_USDC_SUSHI_PAIR: "WETH_USDC_SUSHI_PAIR",
  WETH_USDC_SUSHI_STAKING_REWARD: "WETH_USDC_SUSHI_STAKING_REWARD",
  WETH_WBTC_SUSHI_PAIR: "WETH_WBTC_SUSHI_PAIR",
  WETH_WBTC_SUSHI_STAKING_REWARD: "WETH_WBTC_SUSHI_STAKING_REWARD",
  ZERO_EX_EXCHANGE: "ZERO_EX_EXCHANGE",
  PERPV2_ACCOUNT_BALANCE: "PERPV2_ACCOUNT_BALANCE",
  PERPV2_CLEARINGHOUSE: "PERPV2_CLEARINGHOUSE",
  PERPV2_CLEARINGHOUSE_CONFIG: "PERPV2_CLEARINGHOUSE_CONFIG",
  PERPV2_EXCHANGE: "PERPV2_EXCHANGE",
  PERPV2_INSURANCE_FUND: "PERPV2_INSURANCE_FUND",
  PERPV2_MARKET_REGISTRY: "PERPV2_MARKET_REGISTRY",
  PERPV2_VAULT: "PERPV2_VAULT",
  PERPV2_QUOTER: "PERPV2_QUOTER",

  // Oracles
  ETH_ORACLE_PROXY: "ETH_ORACLE_PROXY",
  DAI_ORACLE_PROXY: "DAI_ORACLE_PROXY",
  BTC_ORACLE_PROXY: "BTC_ORACLE_PROXY",
  USDC_ORACLE_PROXY: "USDC_ORACLE_PROXY",

  // Oracles used by PerpV2
  ETHUSD_PERP_CHAINLINK_ORACLE: "ETHUSD_PERP_CHAINLINK_ORACLE",

  // Chainlink Oracles
  BTC_CHAINLINK_ORACLE: "BTC_CHAINLINK_ORACLE",
  ETH_CHAINLINK_ORACLE: "ETH_CHAINLINK_ORACLE",
  LINK_CHAINLINK_ORACLE: "LINK_CHAINLINK_ORACLE",
  USDC_CHAINLINK_ORACLE: "USDC_CHAINLINK_ORACLE",

  // Exchanges
  UNISWAP_V3_ROUTER: "UNISWAP_V3_ROUTER",
  UNISWAP_V3_QUOTER: "UNISWAP_V3_QUOTER",
  SUSHISWAP_ROUTER: "SUSHISWAP_ROUTER",
  SUSHISWAP_FACTORY: "SUSHISWAP_FACTORY",

  // Admin
  MULTI_SIG_OWNER: "MULTI_SIG_OWNER",

  // System Contracts
  CONTROLLER: "CONTROLLER",
  STREAMING_FEE_MODULE: "STREAMING_FEE_MODULE",
  SET_TOKEN_CREATOR: "SET_TOKEN_CREATOR",
  ISSUANCE_MODULE: "ISSUANCE_MODULE",
  DEBT_ISSUANCE_MODULE_V2:"DEBT_ISSUANCE_MODULE_V2",
  TRADE_MODULE: "TRADE_MODULE",
  INTEGRATION_REGISTRY: "INTEGRATION_REGISTRY",
  SLIPPAGE_ISSUANCE_MODULE: "SLIPPAGE_ISSUANCE_MODULE",
  PERPV2_LIBRARY: "PERPV2_LIBRARY",
  PERPV2_LEVERAGE_MODULE: "PERPV2_LEVERAGE_MODULE",
  PERPV2_BASIS_TRADING_MODULE: "PERPV2_BASIS_TRADING_MODULE",
};
