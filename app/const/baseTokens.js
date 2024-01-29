import { Token } from 'services/Token';

const TESTNET_BASE_TOKENS = [
  new Token(
    'Wrapped BNB',
    'WBNB',
    '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    97,
    18,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/7192.png'
  ),
  new Token(
    'USD Coin',
    'USDC',
    '0xd92271C20A5a3A03d8Eb6244D1c002EBed525605',
    97,
    18,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
  ),
  new Token(
    'Tether',
    'USDT',
    '0x7ef95a0fee0dd31b22626fa2e10ee6a223f8a684',
    97,
    18,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
  ),
  new Token(
    'Dai Token',
    'DAI',
    '0x8a9424745056Eb399FD19a0EC26A14316684e274',
    97,
    18,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
  ),
];

const ETHER_BASE_TOKENS = [
  new Token(
    'Wrapped Ether',
    'WETH',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    1,
    18,
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
  ),
  new Token(
    'USDCoin',
    'USDC',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    1,
    6,
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
  ),
  new Token(
    'Tether USD',
    'USDT',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    1,
    6,
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png'
  ),
  new Token(
    'Uniswap',
    'UNI',
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    1,
    18,
    'ipfs://QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg'
  ),
];

const POLYGON_BASE_TOKENS = [
  new Token(
    'USD Coin',
    'USDC',
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    137,
    6,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
  ),
  new Token(
    'Wrapped Ether',
    'WMATIC',
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    137,
    18,
    'https://static.metaswap.codefi.network/api/v1/tokenIcons/137/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270.png'
  ),
  new Token(
    'Tether USD',
    'USDT',
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    137,
    6,
    'https://wallet-asset.matic.network/img/tokens/usdt.svg'
  ),
];

const MUMBAI_BASE_TOKENS = [
  new Token(
    'USD Coin',
    'USDC',
    '0x4CC22BA6A0fFaA248B6a704330d26Be84DcC1405',
    80001,
    6,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
  ),
  new Token(
    'Wrapped Ether',
    'WMATIC',
    '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
    80001,
    18,
    'https://static.metaswap.codefi.network/api/v1/tokenIcons/137/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270.png'
  ),
];

const ARBITRUM_BASE_TOKENS = [
  new Token(
    'USD Coin',
    'USDC',
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    42161,
    6,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
  ),
  new Token(
    'Wrapped Ether',
    'WETH',
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    42161,
    18,
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
  ),
  new Token(
    'Tether',
    'USDT',
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    42161,
    6,
    'https://assets.coingecko.com/coins/images/325/thumb/Tether.png?1668148663'
  ),
];

const SONGBIRD_BASE_TOKENS = [
  new Token(
    'Wrapped Songbird',
    'WSGB',
    '0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED',
    19,
    18,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/12186.png'
  ),
  new Token(
    'Experimental USDT',
    'exUSDT',
    '0x1a7b46656B2b8b29B1694229e122d066020503D0',
    19,
    6,
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  ),
  new Token(
    'Test 1',
    'TTT1',
    '0xBE57CAb0bA57ba8D0d277Cc77ec5735fCdBB6c6e',
    19,
    6,
    'https://static.metaswap.codefi.network/api/v1/tokenIcons/137/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270.png',
  ),
];

const BASE_TOKENS = [
  new Token(
    'Wrapped BNB',
    'WBNB',
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    56,
    18,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/7192.png'
  ),
  new Token(
    'USD Coin',
    'USDC',
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    56,
    18,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
  ),
  new Token(
    'PancakeSwap',
    'Cake',
    '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    56,
    18,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png'
  ),
  new Token(
    'Binance USD',
    'BUSD',
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    56,
    18,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png'
  ),
  new Token(
    'Bitcoin BEP20',
    'BTCB',
    '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    56,
    18,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/4023.png'
  ),
  new Token(
    'Terra USD',
    'UST',
    '0x23396cF899Ca06c4472205fC903bDB4de249D6fC',
    56,
    18,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/7129.png'
  ),
  new Token(
    'Ethereum BEP20',
    'ETH',
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    56,
    18,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
  ),
  new Token(
    'Binance-Peg USD Coin',
    'USDC',
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    56,
    18,
    'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
  ),
  ...TESTNET_BASE_TOKENS,
  ...ETHER_BASE_TOKENS,
  ...POLYGON_BASE_TOKENS,
  ...ARBITRUM_BASE_TOKENS,
  ...MUMBAI_BASE_TOKENS,
  ...SONGBIRD_BASE_TOKENS,
].map((t) => {
  t.address = t.address.toLowerCase();
  return t;
});

export default BASE_TOKENS;
