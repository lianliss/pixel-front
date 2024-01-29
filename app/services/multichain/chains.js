// Chain ids
export const ETHEREUM_MAINNET = 1;
export const BSC_MAINNET = 56;
export const BSC_TESTNET = 97;
export const POLYGON_MAINNET = 137;
export const ARBITRUM_MAINNET = 42161;
export const POLYGON_MUMBAI = 80001;
export const SONGBIRD = 19;
//export const FLARE = 14;

// Chain is mainnet.
export const isMainnet = {
  [ETHEREUM_MAINNET]: true,
  [BSC_MAINNET]: true,
  [BSC_TESTNET]: true,
  [POLYGON_MAINNET]: true,
  [ARBITRUM_MAINNET]: true,
  [POLYGON_MUMBAI]: true,
  [SONGBIRD]: true,
  //[FLARE]: true,
};

// Chain IDs that are integrated.
export const FINE_CHAIN_IDS = [
  ETHEREUM_MAINNET,
  BSC_MAINNET,
  BSC_TESTNET,
  POLYGON_MAINNET,
  ARBITRUM_MAINNET,
  POLYGON_MUMBAI,
  //FLARE,
  SONGBIRD,
];

export const DEFAULT_CHAIN = SONGBIRD;

export const NETWORKS_DATA = {
  [ETHEREUM_MAINNET]: {
    networkID: 'ETH',
    title: 'Ethereum',
    fiatDecimals: 6,
    scan: 'https://etherscan.io',
    defaultSymbol: 'ETH',
    hops: 0,
  },
  [BSC_MAINNET]: {
    networkID: 'BSC',
    title: 'BSC',
    fiatDecimals: 18,
    scan: 'https://bscscan.com',
    defaultSymbol: 'BNB',
    hops: 1,
  },
  [BSC_TESTNET]: {
    networkID: 'BSCTest',
    title: 'Testnet',
    fiatDecimals: 18,
    scan: 'https://testnet.bscscan.com',
    defaultSymbol: 'BNB',
    hops: 0,
  },
  [POLYGON_MAINNET]: {
    networkID: 'PLG',
    title: 'Polygon',
    fiatDecimals: 6,
    scan: 'https://polygonscan.com',
    defaultSymbol: 'MATIC',
    hops: 0,
  },
  [POLYGON_MUMBAI]: {
    networkID: 'MUM',
    title: 'Testnet',
    fiatDecimals: 6,
    scan: 'https://mumbai.polygonscan.com',
    defaultSymbol: 'MATIC',
    hops: 0,
  },
  [ARBITRUM_MAINNET]: {
    networkID: 'ARB',
    title: 'Arbitrum',
    fiatDecimals: 6,
    scan: 'https://arbiscan.io',
    defaultSymbol: 'ETH',
    hops: 0,
  },
  [SONGBIRD]: {
    networkID: 'SGB',
    title: 'Songbird',
    fiatDecimals: 18,
    scan: 'https://songbird-explorer.flare.network',
    defaultSymbol: 'SGB',
    hops: 0,
  },
  // [FLARE]: {
  //   networkID: 'FLR',
  //   title: 'Flare',
  //   fiatDecimals: 18,
  //   scan: 'https://flare-explorer.flare.network',
  //   defaultSymbol: 'FLR',
  //   hops: 0,
  // },
};
