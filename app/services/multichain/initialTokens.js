import { Token, BaseChainToken } from '../web3Provider/Token';
import {
  ETHEREUM_MAINNET,
  BSC_MAINNET,
  BSC_TESTNET,
  POLYGON_MAINNET,
  POLYGON_MUMBAI,
  ARBITRUM_MAINNET,
  NETWORKS_DATA,
  //FLARE,
  SONGBIRD,
} from './chains';
import baseTokens from 'const/baseTokens';

// Decimals
export const DEFAULT_DECIMALS = 18;

export const TOKEN_LIST_URI = {
  [ETHEREUM_MAINNET]:
    'https://storage.googleapis.com/custom-product-builder/ether_tokens.json',
  [BSC_MAINNET]: 'https://tokens.pancakeswap.finance/cmc.json',
  [POLYGON_MAINNET]:
    'https://storage.googleapis.com/custom-product-builder/polygon_tokens.json',
  [ARBITRUM_MAINNET]:
    'https://storage.googleapis.com/custom-product-builder/arbitrum_tokens.json',
  [POLYGON_MUMBAI]:
    'https://storage.googleapis.com/custom-product-builder/mumbai_tokens.json',
};

export const ABI = {
  [ETHEREUM_MAINNET]: require('const/ABI/Erc20Token'),
  [BSC_MAINNET]: require('const/ABI/Bep20Token'),
  [BSC_TESTNET]: require('const/ABI/Bep20Token'),
  [POLYGON_MAINNET]: require('const/ABI/Erc20Token'),
  [POLYGON_MUMBAI]: require('const/ABI/Erc20Token'),
  [ARBITRUM_MAINNET]: require('const/ABI/Erc20Token'),
  [SONGBIRD]: require('const/ABI/Erc20Token'),
  //[FLARE]: require('const/ABI/Erc20Token'),
};

export const TOKENS = {
  [ETHEREUM_MAINNET]: {
    usdc: new Token(
      'USD Coin',
      'USDC',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      ETHEREUM_MAINNET,
      6,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
    ),
    eth: new BaseChainToken(
      'Ethereum',
      'ETH',
      ETHEREUM_MAINNET,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
    ),
    usdt: new Token(
      'Tether USD',
      'USDT',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ETHEREUM_MAINNET,
      6,
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png'
    ),
    nrfx1: new Token(
      'Narfex v1 (legacy)',
      'NRFXv1',
      '0x01b443495834D667b42f54d2b77eEd6951eD94a4',
      ETHEREUM_MAINNET,
      DEFAULT_DECIMALS,
      'https://static.narfex.com/img/currencies/nrfx_pancake.svg'
    ),
    nrfx: new Token(
      'Narfex',
      'NRFX',
      '0xCc17e34794B6c160a0F61B58CF30AA6a2a268625',
      ETHEREUM_MAINNET,
      DEFAULT_DECIMALS,
      'https://static.narfex.com/img/currencies/nrfx_pancake.svg'
    ),
    wrapETH: new Token(
      'Wrapped Ether',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      'WETH',
      ETHEREUM_MAINNET,
      DEFAULT_DECIMALS,
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    ),
  },
  [BSC_MAINNET]: {
    usdc: new Token(
      'USD Coin',
      'USDC',
      '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      BSC_MAINNET,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
    ),
    usdt: new Token(
      'Tether',
      'USDT',
      '0x55d398326f99059fF775485246999027B3197955',
      BSC_MAINNET,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
    ),
    nrfx: new Token(
      'Narfex',
      'NRFX',
      '0x3764Be118a1e09257851A3BD636D48DFeab5CAFE',
      BSC_MAINNET,
      DEFAULT_DECIMALS,
      'https://static.narfex.com/img/currencies/nrfx_pancake.svg'
    ),
    bnb: new BaseChainToken(
      'Binance Coin',
      'BNB',
      BSC_MAINNET,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/7192.png'
    ),
    wrapBNB: new Token(
      'Wrapped BNB',
      'WBNB',
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      BSC_MAINNET,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/7192.png'
    ),
  },
  [BSC_TESTNET]: {
    wrapBNB: new Token(
      'Wrapped BNB',
      'WBNB',
      '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
      BSC_TESTNET,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/7192.png'
    ),
    usdc: new Token(
      'USD Coin',
      'USDC',
      '0xd92271C20A5a3A03d8Eb6244D1c002EBed525605',
      BSC_TESTNET,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
    ),
    bnb: new BaseChainToken(
      'Binance Coin',
      'BNB',
      BSC_TESTNET,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/7192.png'
    ),
    usdt: new Token(
      'Tether',
      'USDT',
      '0x7ef95a0fee0dd31b22626fa2e10ee6a223f8a684',
      BSC_TESTNET,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
    ),
    nrfx: new Token(
      'Narfex',
      'NRFX',
      '0xcDA8eD22bB27Fe84615f368D09B5A8Afe4a99320',
      BSC_TESTNET,
      DEFAULT_DECIMALS,
      'https://static.narfex.com/img/currencies/nrfx_pancake.svg'
    ),
    busd: new Token(
      'Binance USD',
      'BUSD',
      '0x78867bbeef44f2326bf8ddd1941a4439382ef2a7',
      BSC_TESTNET,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png'
    ),
    dai: new Token(
      'Dai Token',
      'DAI',
      '0x8a9424745056Eb399FD19a0EC26A14316684e274',
      BSC_TESTNET,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
    ),
  },
  [POLYGON_MAINNET]: {
    usdc: new Token(
      'USD Coin',
      'USDC',
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      POLYGON_MAINNET,
      6,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
    ),
    matic: new BaseChainToken(
      'Matic',
      'MATIC',
      POLYGON_MAINNET,
      DEFAULT_DECIMALS,
      'https://static.metaswap.codefi.network/api/v1/tokenIcons/137/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270.png'
    ),
    wrapMATIC: new Token(
      'Wrapped Matic',
      '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      'WMATIC',
      POLYGON_MAINNET,
      DEFAULT_DECIMALS,
      'https://static.metaswap.codefi.network/api/v1/tokenIcons/137/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270.png'
    ),
  },
  [POLYGON_MUMBAI]: {
    usdc: new Token(
      'USD Coin',
      'USDC',
      '0x4CC22BA6A0fFaA248B6a704330d26Be84DcC1405',
      POLYGON_MUMBAI,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
    ),
    matic: new BaseChainToken(
      'Matic',
      'MATIC',
      POLYGON_MUMBAI,
      DEFAULT_DECIMALS,
      'https://static.metaswap.codefi.network/api/v1/tokenIcons/137/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270.png'
    ),
    wrapMATIC: new Token(
      'Wrapped Matic',
      '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
      'WMATIC',
      POLYGON_MUMBAI,
      DEFAULT_DECIMALS,
      'https://static.metaswap.codefi.network/api/v1/tokenIcons/137/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270.png'
    ),
    nrfx: new Token(
      'Narfex',
      'NRFX',
      '0xe48d1C63199aca7B4b4B39068098A0ED27840a8d',
      POLYGON_MUMBAI,
      DEFAULT_DECIMALS,
      'https://static.narfex.com/img/currencies/nrfx_pancake.svg'
    ),
  },
  [ARBITRUM_MAINNET]: {
    usdc: new Token(
      'USD Coin',
      'USDC',
      '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      ARBITRUM_MAINNET,
      6,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
    ),
    eth: new Token(
      'Ethereum',
      'ETH',
      null,
      ARBITRUM_MAINNET,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
    ),
    wrapETH: new Token(
      'Wrapped Ether',
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      'WETH',
      ARBITRUM_MAINNET,
      DEFAULT_DECIMALS,
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    ),
  },
  [SONGBIRD]: {
    sgb: new BaseChainToken(
      'Songbird',
      'SGB',
      SONGBIRD,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/12186.png',
      0.015
    ),
    PXLs: new Token(
      'Pixel Shard',
      'PXLs',
      '0xe2E6562077E349a4eB7f8b6911BF67C953701fDc',
      SONGBIRD,
      DEFAULT_DECIMALS,
      require('styles/svg/logo_icon.svg'),
      false,
      0.175
    ),
    wrapSGB: new Token(
      'Wrapped Songbird',
      'WSGB',
      '0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED',
      SONGBIRD,
      DEFAULT_DECIMALS,
      'https://s2.coinmarketcap.com/static/img/coins/64x64/12186.png',
      false,
      0.015
    ),
    usdc: new Token(
      'Experimental USDT',
      'exUSDT',
      '0x1a7b46656B2b8b29B1694229e122d066020503D0',
      SONGBIRD,
      6,
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
      false,
      1
    ),
  },
};

Object.keys(TOKENS).map((network) => {
  const tokens = TOKENS[network];
  Object.keys(tokens).map((symbol) => {
    tokens[symbol] = {
      ...tokens[symbol],
      address: tokens[symbol].address
        ? tokens[symbol].address.toLowerCase()
        : tokens[symbol].address,
    };
  });
});

export const CHAIN_TOKENS = {
  [ETHEREUM_MAINNET]: TOKENS[ETHEREUM_MAINNET].eth,
  [BSC_MAINNET]: TOKENS[BSC_MAINNET].bnb,
  [BSC_TESTNET]: TOKENS[BSC_TESTNET].bnb,
  [POLYGON_MAINNET]: TOKENS[POLYGON_MAINNET].matic,
  [POLYGON_MUMBAI]: TOKENS[POLYGON_MUMBAI].matic,
  [ARBITRUM_MAINNET]: TOKENS[ARBITRUM_MAINNET].eth,
  [SONGBIRD]: TOKENS[SONGBIRD].sgb,
};

export const WRAP_TOKENS = {
  [ETHEREUM_MAINNET]: TOKENS[ETHEREUM_MAINNET].wrapETH,
  [BSC_MAINNET]: TOKENS[BSC_MAINNET].wrapBNB,
  [BSC_TESTNET]: TOKENS[BSC_TESTNET].wrapBNB,
  [POLYGON_MAINNET]: TOKENS[POLYGON_MAINNET].wrapMATIC,
  [POLYGON_MUMBAI]: TOKENS[POLYGON_MUMBAI].wrapMATIC,
  [ARBITRUM_MAINNET]: TOKENS[ARBITRUM_MAINNET].wrapETH,
  [SONGBIRD]: TOKENS[SONGBIRD].wrapSGB,
};

export const DISPLAY_TOKENS = {
  [ETHEREUM_MAINNET]: [
    TOKENS[ETHEREUM_MAINNET].eth,
    TOKENS[ETHEREUM_MAINNET].usdt,
    TOKENS[ETHEREUM_MAINNET].nrfx,
    TOKENS[ETHEREUM_MAINNET].nrfx1,
    ...baseTokens.filter((t) => t.chainId === ETHEREUM_MAINNET),
  ],
  [BSC_MAINNET]: [
    TOKENS[BSC_MAINNET].bnb,
    TOKENS[BSC_MAINNET].nrfx,
    TOKENS[BSC_MAINNET].usdt,
    ...baseTokens.filter((t) => t.chainId === BSC_MAINNET),
  ],
  [BSC_TESTNET]: [
    TOKENS[BSC_TESTNET].nrfx,
    TOKENS[BSC_TESTNET].busd,
    TOKENS[BSC_TESTNET].bnb,
    TOKENS[BSC_TESTNET].usdt,
    TOKENS[BSC_TESTNET].dai,
    ...baseTokens.filter((t) => t.chainId === BSC_TESTNET),
  ],
  [POLYGON_MAINNET]: [
    TOKENS[POLYGON_MAINNET].usdc,
    TOKENS[POLYGON_MAINNET].matic,
    TOKENS[POLYGON_MAINNET].wrapMATIC,
    ...baseTokens.filter((t) => t.chainId === POLYGON_MAINNET),
  ],
  [POLYGON_MUMBAI]: [
    TOKENS[POLYGON_MUMBAI].usdc,
    TOKENS[POLYGON_MUMBAI].nrfx,
    TOKENS[POLYGON_MUMBAI].matic,
    TOKENS[POLYGON_MUMBAI].wrapMATIC,
    ...baseTokens.filter((t) => t.chainId === POLYGON_MUMBAI),
  ],
  [ARBITRUM_MAINNET]: [
    TOKENS[ARBITRUM_MAINNET].usdc,
    TOKENS[ARBITRUM_MAINNET].eth,
    TOKENS[ARBITRUM_MAINNET].wrapETH,
    ...baseTokens.filter((t) => t.chainId === ARBITRUM_MAINNET),
  ],
  [SONGBIRD]: [
    TOKENS[SONGBIRD].sgb,
    TOKENS[SONGBIRD].usdc,
    TOKENS[SONGBIRD].wrapSGB,
    ...baseTokens.filter((t) => t.chainId === SONGBIRD),
  ],
};

// Common Bases
const initialCommonBases = ['WSGB', 'exUSDT'];
const getCommonBases = (chainId, arr = []) =>
  [NETWORKS_DATA[chainId].defaultSymbol].concat(arr, initialCommonBases);

export const COMMON_BASES = {
  [ETHEREUM_MAINNET]: getCommonBases(ETHEREUM_MAINNET),
  [BSC_MAINNET]: getCommonBases(BSC_MAINNET),
  [BSC_TESTNET]: getCommonBases(BSC_TESTNET),
  [POLYGON_MAINNET]: getCommonBases(POLYGON_MAINNET),
  [POLYGON_MUMBAI]: getCommonBases(POLYGON_MUMBAI),
  [ARBITRUM_MAINNET]: getCommonBases(ARBITRUM_MAINNET),
  [SONGBIRD]: getCommonBases(SONGBIRD),
};
