import Eth from 'web3-eth';
import Contract from 'web3-eth-contract';
import * as CONNECTORS from "services/multiwallets/connectors";
import {FiatToken, Token} from "services/web3Provider/Token";
import {
  toHex,
  toChecksumAddress,
  toBigInt,
  numberToHex,
  utf8ToHex,
  toNumber,
} from 'web3-utils';
import {getCreate2Address} from "@ethersproject/address";
import {keccak256, pack} from "@ethersproject/solidity";
import hmacSha256 from 'crypto-js/hmac-sha256';
import encoderHex from 'crypto-js/enc-hex';
import getAllPairsCombinations from 'utils/getPairCombinations';
import chunk from "lodash/chunk";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";
import KNOWN_FIATS from "const/knownFiats";
import cloneDeep from "lodash/cloneDeep";
import {marketCoins} from "services/coingeckoApi";
import {
  getRequestMethods,
  getConnectorObject,
  fetchEthereumRequest as fetchRequest,
  getFineChainId,
} from 'services/multiwallets/multiwalletsDifference';
import {CHAIN_TOKENS} from "services/multichain/initialTokens";
import {NETWORKS_DATA} from "services/multichain/chains";
import {CONTRACT_ADDRESSES} from "services/multichain/contracts";
import toaster from 'services/toaster';
import {HttpProvider} from "web3-providers-http";
import {IS_TELEGRAM} from "const";
import PixelWallet from "services/multiwallets/pixelWallet";
import {Pair, Trade, Percent, JSBI, TokenAmount, CurrencyAmount, Token as TokenSDK, Fraction} from '@narfex/sdk';
import wei from "utils/wei";
import significant from "utils/significant";
import {api} from "utils/async/api";
import includes from "lodash/includes";

const AWAITING_DELAY = 2000;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000));
const ONE_HUNDRED_PERCENT = new Percent('1');

export function toBN(number) {
  return toBigInt(number)
}

export function getEth() {
  if (this.state.isConnected) {
    return this.eth;
  } else {
    return this.ethHost;
  }
}

export async function getBackendSign(hash, message) {
  const {isConnected, accountAddress} = this.state;
  if (!isConnected) throw new Error('Wallet is not connected');
  try {
    const key = `pixel-sign-${hash}`;
    let sign = window.localStorage.getItem(key);
    if (sign) {
      return sign;
    }
    if (!this.signs[accountAddress]) {
      this.signs[accountAddress] = new Promise(async (fulfill, reject) => {
        try {
          sign = await this.fetchEthereumRequest({
            method: this.requestMethods.personal_sign,
            params: [
              utf8ToHex(message),
              accountAddress,
            ],
          });
          window.localStorage.setItem(key, sign);
          fulfill(sign);
        } catch (error) {
          console.error('[getBackendSign][fetchEthereumRequest]', error);
          reject(error);
          this.signs[accountAddress] = undefined;
        }
      })
    }
    return await this.signs[accountAddress];
  } catch (error) {
    console.error('[getBackendSign]', error);
    throw error;
  }
}

export async function backendRequest(path, params = {}, method = 'get', additionalOptions = {}) {
  const {isConnected, accountAddress} = this.state;
  if (!isConnected) throw new Error('Wallet is not connected');
  try {
    const hash = hmacSha256(accountAddress, 'pixel-signature').toString(encoderHex);
    const message = `Sign up with code ${hash}`;
    const sign = await this.getBackendSign(hash, message);
    
    let additionalHeaders = {};
    if (additionalOptions.headers) {
      additionalHeaders = additionalOptions.headers;
      delete additionalOptions.headers;
    }
    return await api[method](path, {
      headers: {
        'Pixel-Message': hash,
        'Pixel-Sign': sign,
        ...additionalHeaders,
      },
      params: {
        ...params,
        chainId: get(this.network, 'chainId'),
      },
      ...additionalOptions,
    });
  } catch (error) {
    console.error('[backendRequest]', error);
    throw error;
  }
}

export async function fetchEthereumRequest(requestObject, ethereum) {
  return await fetchRequest.bind(this)(requestObject, ethereum);
}

export async function initProvider() {
  const provider = new HttpProvider(
    this.network.contractAddresses.providerAddress
  );
  this.ethHost = new Eth(provider);
  this.loadCustomTokens();
  this.loadCustomLP();
  
  if (IS_TELEGRAM) {
    window.pixelWallet = new PixelWallet(this, provider);
  }
}

export async function connectPixelWallet(privateKey) {
  try {
    if (!privateKey) throw new Error('No privateKey founded');
    const account = window.pixelWallet.connect(privateKey);
    this.connectWallet(CONNECTORS.PIXEL, false, account);
  } catch (error) {
    console.error('[connectPixelWallet]', error);
  }
}

/**
 * Connect to web3 wallet plugin
 * @returns {Promise.<void>}
 */
export async function connectWallet(connector = this.state.connector, showErrorMessage = true, account) {
  try {
    // Get connector.
    let ethereumObject = getConnectorObject(connector);
    
    if (!ethereumObject) {
      if (showErrorMessage) {
        toaster.error('No wallet plugins detected');
      }
      
      return;
    }
    
    this.ethereum = ethereumObject.ethereum;
    this.requestMethods = getRequestMethods(connector);
    const provider = ethereumObject.provider;
    
    this.successConnectionCheck = true;
    if (connector === CONNECTORS.WALLET_CONNECT) {
      await provider.enable();
      
      provider.on('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          window.localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');
        }
      });
    }
    
    this.eth = new Eth(provider);
    this.eth.handleRevert = true;
    
    // Set account address
    const accountAddress = (
      await this.fetchEthereumRequest({
        method: this.requestMethods.request_accounts
      }))[0];
    
    if (!accountAddress) {
      throw new Error('No accounts connected');
    }
    
    this.setState({
      connector
    });
    
    // Set the chain id after an account address setted
    // because the address maybe empty.
    let chainId = Number(await this.eth.getChainId());
    if (chainId) {
      this.setChain(chainId, false);
    }
    
    this.walletConnectorStorage().set(connector);
    
    if (!chainId) {
      chainId = Number(await this.eth.getChainId());
      this.setChain(chainId, false);
    }
    
    // Set provider state
    if (!this._mounted) return;
    this.setState({
      isConnected: true,
      accountAddress,
    });
    
    // Clear old events
    this.ethereumUnsubscribe();
    this.ethereumSubsribe();
    
    //this.checkRefer();
    
    // On account address change
  } catch (error) {
    console.error('[connectWallet]', error);
    this.walletConnectorStorage().clear();
    
    throw error;
  }
}

export async function logout() {
  this.setBalances([], 'clear');
  this.setState({
    tokens: this.network.displayTokens,
    isConnected: false,
    accountAddress: null,
    chainId: null,
    tokensLoaded: false,
    fiatsLoaded: false,
  });
  
  // Clear default wallet connection.
  this.cmcTokens = undefined;
  this.walletConnectorStorage().clear();
  this.getTokens();
  
  switch (this.state.connector) {
    case CONNECTORS.WALLET_CONNECT:
      await this.ethereum.disconnect();
      break;
    default:
      break;
  }
  
  this.eth = null;
}

export async function addCustomToken(_address) {
  let address, token;
  if (typeof _address === 'string') {
    address = toChecksumAddress(_address);
  } else {
    token = _address;
    address = token.address;
  }
  if (this.customTokens.find(t => t.address === address)) return;
  
  if (typeof _address === 'string') {
    token = await this.initCustomToken(_address);
  }
  if (!token) return;
  
  this.customTokens.push(token);
  this.storage.set({
    customTokens: this.customTokens.map(token => {
      return Object.assign({}, token);
    })
  });
  this.updateStateCustomTokens();
}

export async function addCustomLP(_address) {
  let address, token;
  if (typeof _address === 'string') {
    address = toChecksumAddress(_address);
  } else {
    token = _address;
    address = token.address;
  }
  if (this.customLP.find(t => t.address === address)) return;
  
  if (typeof _address === 'string') {
    token = await this.initCustomLP(_address);
  }
  if (!token) return;
  
  this.customLP.push(token);
  this.storage.set({
    customLP: this.customLP.map(token => {
      return Object.assign({}, token);
    })
  });
  this.updateStateCustomTokens();
}

export async function initCustomToken(_address) {
  const address = toChecksumAddress(_address);
  try {
    const contract = await this.getContract(this.network.tokenABI, address);
    const data = await Promise.all([
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.decimals().call(),
    ]);
    return new Token(
      data[0],
      data[1],
      address,
      this.state.chainId,
      Number(data[2]),
      'https://dex.oracleswap.io/_next/static/media/SGB.88221107.png',
      true,
    )
  } catch (error) {
    console.error('[initCustomToken]', error);
    return null;
  }
}

export async function initCustomLP(_address) {
  const address = toChecksumAddress(_address);
  try {
    const contract = await this.getContract(require('const/ABI/PancakePair'), address);
    const data = await Promise.all([
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.decimals().call(),
      contract.methods.token0().call(),
      contract.methods.token1().call(),
    ]);
    const token0 = data[3];
    const token1 = data[4];
    await Promise.all([
      this.addCustomToken(data[3]),
      this.addCustomToken(data[4]),
    ]);
    return new Token(
      data[0],
      data[1],
      address,
      this.state.chainId,
      Number(data[2]),
      'https://dynamic-assets.coinbase.com/a1f4b7b34069888e313f284b49012a01b3bbc37b5113319c7105170a8fe268de8f60be5a0af7a8dafa8aba31fcc21ef44bc30c1e8bbb8379064ac94965bccf26/asset_icons/aafc2f5fff21664213e2a5a2c6e31aa055f277d1069b16745d54f84c0e94f1f3.png',
      true,
    )
  } catch (error) {
    console.error('[initCustomLP]', error);
    return null;
  }
}

/**
 * Calculate the Liquidity Pair address
 * @param _token0 {object} - raw token data
 * @param _token1 {object} - raw token data
 * @returns {Promise.<void>}
 */
export async function getPairAddress(_token0, _token1) {
  const token0 = _token0.address ? _token0 : this.network.wrapToken;
  const token1 = _token1.address ? _token1 : this.network.wrapToken;
  
  let first;
  let second;
  
  if (token0.address.toLowerCase() < token1.address.toLowerCase()) {
    first = token0;
    second = token1;
  } else {
    first = token1;
    second = token0;
  }
  
  return getCreate2Address(
    this.network.contractAddresses.factoryAddress,
    keccak256(
      ['bytes'],
      [pack(['address', 'address'], [first.address, second.address])]),
    this.network.contractAddresses.factoryInitCodeHash);
}

/**
 * Returns all available pairs for trade between two tokens with their liquidity
 * @param _token0 {object} - raw token data
 * @param _token1 {object} - raw token data
 * @returns {Promise.<void>}
 */
export async function getPairs(_token0, _token1, maxHops = 3) {
  const token0 = _token0.address ? _token0 : this.network.wrapToken;
  const token1 = _token1.address ? _token1 : this.network.wrapToken;
  
  // Get all possible pairs combinations
  const combinations = maxHops
    ? getAllPairsCombinations(token0, token1, this.network.chainId)
    : [[token0, token1]];
  const addresses = Promise.all(combinations.map(pair => this.getPairAddress(pair[0], pair[1])));
  
  // Get a liquidity for each pair
  const results = await Promise.allSettled(addresses.map(pairAddress => {
    const pairContract = new Contract(
      require('const/ABI/PancakePair'),
      pairAddress,
    );
    pairContract.setProvider(this.eth.currentProvider);
    return pairContract.methods.getReserves().call();
  }));
  
  // Process pairs liquidities
  return results.map((result, index) => {
    if (result.status !== 'fulfilled') return null;
    
    const pair = combinations[index];
    const token0 = this.getToken(pair[0]);
    const token1 = this.getToken(pair[1]);
    const isForward = token0.address.toLowerCase() < token1.address.toLowerCase(); // True if token0 is the first token of LP
    const reserve0 = get(result, 'value._reserve0', 0);
    const reserve1 = get(result, 'value._reserve1', 0);
    const tokenAmount0 = new TokenAmount(token0, isForward ? reserve0 : reserve1);
    const tokenAmount1 = new TokenAmount(token1, isForward ? reserve1 : reserve0);
    
    return new Pair(tokenAmount0, tokenAmount1);
  }).filter(r => r);
}

/**
 * Update balance, or add if it not exist.
 * @param token {object} token object
 * @param type {string} fiats, tokens
 */
export async function updateTokenInBalances(token, type = 'tokens') {
  this.setBalances((prevBalances) => {
    let finded = false;
    const newBalances = prevBalances.map((prevBalancesToken) => {
      if (prevBalancesToken.symbol === token.symbol) {
        finded = true;
        
        return token;
      }
      
      return prevBalancesToken;
    });
    
    if (!finded) {
      newBalances.push(token);
    }
    
    return newBalances;
  }, type);
}

/**
 * Add to state new token object with balance.
 * @param {string} address
 * @param {string} balance
 */
export async function updateTokenBalance(address, balance) {
  this.setState((state) => {
    const tokens = [...state.tokens];
    const tokenIndex = tokens.findIndex(
      (t) => t.address === address
    );
    
    tokens[tokenIndex] = {
      ...tokens[tokenIndex],
      balance,
    };
    
    return {tokens};
  });
}

/**
 * Sets a provider of chainId and connector to the web3
 * @param {number} chainId
 * @returns {void}
 */
export async function setProvider(chainId) {
  if (!CONTRACT_ADDRESSES[chainId]) return;
  const hostProvider = new HttpProvider(
    CONTRACT_ADDRESSES[chainId].providerAddress
  );
  this.ethHost.setProvider(hostProvider);
  
  if (!this.eth) return;
  
  const {connector} = this.state;
  const ethereumObject = getConnectorObject(connector, chainId);
  if (!ethereumObject) {
    if (showErrorMessage) {
      toaster.error('RPC Provider error.');
    }
    
    return;
  }
  
  if (connector === CONNECTORS.WALLET_CONNECT) {
    await provider.enable();
  }
  
  this.eth.setProvider(ethereumObject.provider);
}

/**
 * Get tokens list from the Coin Market Cap
 * @returns {Promise.<void>}
 */
export async function getTokens() {
  // Addresses with problems which have to skip.
  const incorrectAddresses = [];
  
  // @param token.
  // Returns boolean if token is fine.
  const fineToken = (t) => {
    return !!(
      !!t
      && t.chainId === this.network.chainId
      && !incorrectAddresses.find((address) => address === t.address)
    );
  };
  
  try {
    let tokens = this.cmcTokens;
    this.setState({
      tokensChain: this.network.chainId,
    });
    
    const tokenListURI = this.network.tokenListURI;
    if (!tokens && tokenListURI) {
      const request = tokenListURI && await axios.get(tokenListURI);
      tokens = get(request, 'data.tokens').map((t) => {
        return new Token(
          t.name,
          t.symbol,
          t.address.toLowerCase(),
          t.chainId,
          t.decimals,
          t.logoURI
        );
      });
      this.cmcTokens = tokens;
      this.setState({
        tokensLoaded: true,
      });
    }
    
    if (!tokens) {
      tokens = [];
    }
    if (!this.network.mainnet) return [];
    if (!this._mounted) return;
    const result = uniqBy(
      [...this.state.tokens, ...tokens],
      'address'
    ).filter(fineToken);
    this.setState({
      tokens: result,
      tokensLoaded: true,
    });
    return result;
  } catch (error) {
    console.error(`Can't get tokens list`, error);
  }
}

/**
 * Returns current pair reserves
 * @param _token0 {object|address} Token object or pair address
 * @param _token1 {object|undefined} Token object or undefined if the pair address passed
 * @returns {Promise.<*>}
 */
export async function getReserves(_token0, _token1) {
  let token0;
  let token1;
  let pairAddress;
  if (_token1) {
    // If tokens passed
    token0 = _token0.address ? _token0 : this.network.wrapToken;
    token1 = _token1.address ? _token1 : this.network.wrapToken;
    pairAddress = await this.getPairAddress(token0, token1);
  } else {
    // If only pair passed
    pairAddress = _token0;
  }
  
  try {
    const reserves = this.pairs[pairAddress];
    const tokens = [
      ...this.getFiatsArray(),
      ...this.state.tokens,
    ];
    if (reserves) {
      if (_token1) {
        // If tokens passed
        return [
          reserves[token0.symbol],
          reserves[token1.symbol],
          reserves,
        ]
      } else {
        // If pair passed
        return [
          reserves[reserves.token0.symbol],
          reserves[reserves.token1.symbol],
          reserves,
        ]
      }
    }
    const contract = await this.getContract(
      require('const/ABI/PancakePair'),
      pairAddress,
    );
    
    const data = await Promise.all([
      contract.methods.getReserves().call(),
      contract.methods.token0().call(),
      contract.methods.token1().call(),
      contract.methods.totalSupply().call(),
    ]);
    if (!_token1) {
      const dataToken0 = data[1].toLowerCase();
      const dataToken1 = data[2].toLowerCase();
      // If no tokens passed
      token0 = tokens.find(t => t.address && t.address.toLowerCase() === dataToken0);
      token1 = tokens.find(t => t.address && t.address.toLowerCase() === dataToken1);
    }
    // Switch pair
    const isZeroTokenFirst = token0.address.toLowerCase() < token1.address.toLowerCase();
    const result = isZeroTokenFirst
      ? [
        data[0][0],
        data[0][1],
      ]
      : [
        data[0][1],
        data[0][0],
      ];
    // Skip caching is there is no tokens found
    if (!token0 || !token1) return result;
    // Update reserves cache
    this.pairs[pairAddress] = {
      blockTimestamp: data[0]._blockTimestampLast * 1000,
      updateTimestamp: Date.now(),
      token0: isZeroTokenFirst ? token0 : token1,
      token1: isZeroTokenFirst ? token1 : token0,
      totalSupply: data[3],
      address: pairAddress,
      decimals: 18,
    };
    this.pairs[pairAddress][token0.symbol] = result[0];
    this.pairs[pairAddress][token1.symbol] = result[1];
    result.push(this.pairs[pairAddress]);
    return result;
  } catch (error) {
    console.error('[getReserves]', pairAddress, error);
  }
}

/**
 * Returns relation between tokens reserves, which means that for 1 token0 you will get n number of token1
 * @param _token0 {object}
 * @param _token1 {object}
 * @param pair {address} - pair of this tokens for more optimization (optional)
 * @returns {Promise.<number>}
 */
export async function getTokensRelativePrice(_token0, _token1, amount = 1, isAmountIn = false) {
  const token0 = _token0.address ? _token0 : this.network.wrapToken;
  const token1 = _token1.address ? _token1 : this.network.wrapToken;
  
  try {
    const {toBN} = this;
    const decimals = Number(get(token0, 'decimals', 18));
    const amountWei = wei.to(amount, decimals);
    const amountHex = numberToHex(amountWei);
    
    // Get token0 address and decimals value from the pair
    const routerContract = await this.getContract(
      require('const/ABI/PancakeRouter'),
      this.network.contractAddresses.routerAddress,
    );
    
    const getMethod = isAmountIn
      ? routerContract.methods.getAmountsIn
      : routerContract.methods.getAmountsOut;
    const data = await getMethod(
      amountHex,
      [token0.address, token1.address],
    ).call();
    return wei.from(data[1], Number(get(token1, 'decimals', 18)));
  } catch (error) {
    console.error('[getTokensRelativePrice]', error);
  }
}

export async function getContract(abi, address) {
  const contract = new Contract(abi, address, {
    provider: this.eth.currentProvider,
  });
  return contract;
}

/**
 * Returns token price in USDC
 * @param token {object}
 * @returns {Promise.<number>}
 */
export async function getTokenUSDPrice(token) {
  try {
    const USDC = this.state.tokens.find(t => t.symbol === 'exUSDT');
    const address = token.address ? token.address.toLowerCase() : null;
    
    if (address === USDC.address.toLowerCase()) return 1;
    const data = await this.getTokenContract(token).getOutAmount(
      USDC,
      1,
      this.network.hops
    );
    
    return get(data, 'outAmount', 0);
  } catch (error) {
    console.warn('[getTokenUSDPrice]', error);
    return 0;
  }
}

/**
 * Returns tokens balance on the current account
 * @param tokenContractAddress {address} - token contract address.
 * Can be undefined. In that case the method will return BNB balance
 * @returns {Promise.<*>}
 */
export async function getTokenBalance(tokenContractAddress = null) {
  try {
    if (!this.state.isConnected) return "0";
    const {accountAddress} = this.state;
    
    if (tokenContractAddress) {
      // Return token balance
      const contract = await this.getContract(
        require('const/ABI/Bep20Token'),
        tokenContractAddress,
      );
      return await contract.methods.balanceOf(accountAddress).call();
    } else {
      // Return default balance
      return await (this.eth.getBalance(accountAddress));
    }
  } catch (error) {
    console.error('[getTokenBalance]', this.getBSCScanLink(tokenContractAddress), error);
    return '0';
  }
}

/**
 * Returns tokens balances.
 * @param tokenContractAddresses {address[]} - token contract addresses array.
 * @returns {Promise.<array>}
 */
export async function getTokensBalances(contractAddresses) {
  try {
    const contract = await this.getContract(
      require('const/ABI/NarfexOracle'),
      this.network.contractAddresses.narfexOracle,
    );
    const results = await contract.methods
      .getBalances(this.state.accountAddress, contractAddresses)
      .call();
    
    return results;
  } catch (error) {
    console.error('[getTokensBalances]', error);
    return [];
  }
}

/**
 * Returns LP token price in USDT
 * @param pairAddress {string} - address of LP token
 * @param isForce {bool} - is force update
 * @returns {Promise.<number>}
 */
export async function getPairUSDTPrice(pairAddress, isForce = false) {
  if (typeof this.state.prices[pairAddress] !== 'undefined' && !isForce) return this.state.prices[pairAddress];
  const newPairState = {};
  if (!isForce) {
    newPairState[pairAddress] = 0;
    this.setState({
      prices: {
        ...this.state.prices,
        ...newPairState,
      }
    });
  }
  try {
    const reserves = await this.getReserves(pairAddress);
    // const {tokens} = this.state;
    // const contract = new (this.getEth().Contract)(
    //   require('const/ABI/PancakePair'),
    //   pairAddress,
    // );
    // const data = await Promise.all([
    //   contract.methods.getReserves().call(),
    //   contract.methods.totalSupply().call(),
    //   contract.methods.token0().call(),
    //   contract.methods.token1().call(),
    // ]);
    // const token0 = this.state.tokens.find(t => t.address && t.address.toLowerCase() === data[2].toLowerCase())
    //   || {address: data[2], decimals: 18};
    // const token1 = this.state.tokens.find(t => t.address && t.address.toLowerCase() === data[3].toLowerCase())
    //   || {address: data[3], decimals: 18};
    // const reserve0 = wei.from(data[0]._reserve0, token0.decimals);
    // const reserve1 = wei.from(data[0]._reserve1, token0.decimals);
    // const totalSupply = wei.from(data[1]);
    const token0 = reserves[2].token0;
    const token1 = reserves[2].token1;
    const reserve0 = reserves[0];
    const reserve1 = reserves[1];
    const totalSupply = reserves[2].totalSupply;
    const prices = await Promise.all([
      this.getTokenUSDPrice(token0),
      this.getTokenUSDPrice(token1),
    ]);
    newPairState[pairAddress] = (reserve0 * prices[0] + reserve1 * prices[1]) / totalSupply;
    this.setState({
      prices: {
        ...this.state.prices,
        ...newPairState,
      }
    });
    return newPairState[pairAddress];
  } catch (error) {
    console.error('[getPairPrice]', error);
    return 0;
  }
}

/**
 * Preload all tokens balances for current account
 * @param accountAddress
 * @param choosenTokens {array}
 * @param loadAgain {bool} - loadbalances when balances getted.
 * @param required {bool} - loadbalances is required for another connectors.
 * @returns {Promise.<void>}
 */
export async function loadAccountBalances(
  accountAddress = this.state.accountAddress,
  forceUpdate = false,
) {
  try {
    // Only MetaMask have a good provider
    // for send more requests on one time.
    const isMetamask = IS_TELEGRAM || this.state.connector === CONNECTORS.METAMASK &&
      get(window, 'ethereum.isMetaMask');
    // Set positive balance tokens
    this.setBalances(this.state.tokens.filter((t) => t.balance > 0));
    
    if (!this.state.isConnected) return;
    // Stop additional loads
    if (
      (this.state.balancesRequested === accountAddress && !forceUpdate) &&
      this.state.balancesChain === this.state.chainId
    ) return;
    this.setState({
      balancesRequested: accountAddress,
      balancesChain: this.state.chainId,
    });
    
    // Clear tokens balances
    this.setBalances([], 'tokens');
    
    // Separate tokens to small chunks
    const tokenIsFine = (t) => {
      return !!(t.chainId === this.state.chainId && t.address);
    };
    
    const choosenTokens = !isMetamask ? await this.getChoosenTokens() : [];
    const tokens = !isMetamask
      ? choosenTokens.filter(tokenIsFine)
      : this.state.tokens.filter(tokenIsFine);
    
    await this.setChainTokenBalance();
    
    const oneChunkNumber = 256;
    const chunks = chunk(tokens, oneChunkNumber);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const addresses = chunk.map((t) => t.address);
      
      // Get request from the blockchain
      const results = await this.getTokensBalances(addresses);
      // Process the results
      this.setState((state) => {
        const newState = {...state};
        // Process each token
        chunk.map((token, index) => {
          const key = this.getTokenBalanceKey(token, accountAddress);
          const result = results[index];
          const balance = typeof result !== 'undefined' ? result : '0';
          const tokenAddress = token.address
            ? token.address.toLowerCase()
            : token.address;
          
          // Apply a new balance to the state
          newState[key] = balance;
          token.balance = balance;
          
          // Get token price for non-zero balance
          if (balance !== "0") {
            this.getTokenUSDPrice(token).then(price => {
              if (!price) {
                return;
              }
              // Save to the state
              this.setState(state => {
                const tokenState = state.tokens
                  .find(t => (t.address ? t.address.toLowerCase() : t.address) === tokenAddress);
                if (!tokenState) return;
                
                // Update token price
                tokenState.price = price;
                return state;
              });
              this.setBalances(state => [...state, token]);
            }).catch(error => {
              console.error('[loadAccountBalances][getTokenUSDPrice]', token.symbol, token.address, error);
            })
          }
        });
        return newState;
      });
    }
    return 'loaded';
  } catch (error) {
    console.error('[loadAccountBalances]', accountAddress, error);
    return 'error';
  }
}

// Set chain token balance to balances and tokens.
export async function setChainTokenBalance() {
  try {
    // Get Chain token balance
    let chainToken = CHAIN_TOKENS[this.network.chainId];
    const chainTokenBalance = await this.eth.getBalance(
      this.state.accountAddress
    );
    
    if (chainTokenBalance === '0') return false;
    const chainTokenPrice = await this.getTokenUSDPrice(chainToken);
    
    // Set chain token balance to state.
    this.setState((state) => {
      const tokens = state.tokens.map((token) => {
        if (token.symbol === chainToken.symbol) {
          // Token with balance and price.
          token.balance = chainTokenBalance;
          token.price = chainTokenPrice || token.price || 0;
        }
        
        return token;
      });
      
      return {...state, tokens};
    });
    
    this.setBalances((tokens) => {
      chainToken = this.state.tokens.find(t => t.symbol === chainToken.symbol);
      
      return [...tokens, chainToken];
    }, 'tokens');
    
    return true;
  } catch (error) {
    console.error('[setChainTokenBalance]', error);
    return false;
  }
}

/**
 * Exchange the pair
 * @param pair {array}
 * @param trade {object}
 * @param slippageTolerance {integer}
 * @param isExactIn {bool}
 * @returns {Promise.<*>}
 */
export async function swap(pair, trade, slippageTolerance = 2, isExactIn = true, deadline = 20) {
  const {accountAddress} = this.state;
  const routerContract = await this.getContract(
    require('const/ABI/PancakeRouter'),
    this.network.contractAddresses.routerAddress,
  );
  const isFromBNB = !get(pair, '[0].address');
  const isToBNB = !get(pair, '[1].address');
  
  // Calculate slippage tolerance tokens amount
  const slippageFraction = this.numberToFraction(slippageTolerance).divide(100);
  const slippageAmount = isExactIn
    ? trade.outputAmount.asFraction.multiply(slippageFraction)
    : trade.inputAmount.asFraction.multiply(slippageFraction);
  
  // Generate swap contract method name
  let method = 'swap';
  method += isExactIn ? 'Exact' : '';
  method += isFromBNB ? 'ETH' : 'Tokens';
  method += 'For';
  method += !isExactIn ? 'Exact' : '';
  method += isToBNB ? 'ETH' : 'Tokens';
  
  const options = [];
  let value;
  if (isExactIn) {
    
    // From exact tokens
    const amountIn = this.fractionToHex(trade.inputAmount.asFraction, pair[0].decimals);
    if (!isFromBNB) { // Do not set amountIn if BNB first
      options.push(amountIn);
    } else {
      value = amountIn;
    }
    
    const amountOutMin = this.fractionToHex(trade.outputAmount.asFraction.subtract(slippageAmount), pair[1].decimals);
    options.push(amountOutMin);
    
  } else {
    
    // To exact tokens
    const amountOut = this.fractionToHex(trade.outputAmount.asFraction, pair[1].decimals);
    options.push(amountOut);
    
    const amountInMax = this.fractionToHex(trade.inputAmount.asFraction.add(slippageAmount), pair[0].decimals);
    if (!isFromBNB) { // Do not set amountIn if BNB first
      options.push(amountInMax);
    } else {
      value = amountInMax;
    }
    
  }
  
  // Swap route
  const path = trade.route.path.map(token => token.address);
  options.push(path);
  
  options.push(accountAddress); // "to" field
  options.push(numberToHex(Math.round(Date.now() / 1000) + 60 * deadline)); // Deadline
  
  try {
    try {
      // Try to estimate transaction without fee support
      await this.estimateTransaction(routerContract, method, options);
    } catch (error) {
      console.error(`[swap] Estimate method "${method}" error. Try to add "SupportingFeeOnTransferTokens"`);
      // Add fee support
      method += 'SupportingFeeOnTransferTokens';
    }
    // Run transaction
    return await this.transaction(routerContract, method, options, value);
  } catch (error) {
    console.error('[swap]', error);
    throw error;
  }
}

export async function estimateTransaction(contract, method, params) {
  try {
    const accountAddress = get(this, 'state.accountAddress');
    const data = contract.methods[method](...params);
    return await data.estimateGas({from: accountAddress, gas: 50000000000});
  } catch (error) {
    throw error;
  }
};

/**
 * Send transaction to connected wallet
 * @param contract {object}
 * @param method {string} - method name
 * @param params {array} - array of method params
 * @param value {number} - amount of BNB in wei
 * @returns {Promise.<*>}
 */
export async function transaction(contract, method, params, value = 0) {
  try {
    const accountAddress = get(this, 'state.accountAddress');
    const data = contract.methods[method](...params);
    const gasEstimationParams = {from: accountAddress, gas: 50000000000};
    if (value) {
      gasEstimationParams.value = value;
    }
    const promises = await Promise.all([
      this.eth.getTransactionCount(accountAddress),
      this.eth.getGasPrice(),
      data.estimateGas(gasEstimationParams),
    ]);
    const count = promises[0];
    const gasPrice = promises[1];
    const gasLimit = promises[2];
    const rawTransaction = {
      chainId: this.state.chainId,
      from: accountAddress,
      gasPrice: numberToHex(gasPrice),
      gasLimit: numberToHex(gasLimit),
      gas: null,
      to: contract._address,
      data: data.encodeABI(),
      nonce: numberToHex(count),
    };
    if (value) {
      rawTransaction.value = numberToHex(value);
    }
    return await this.fetchEthereumRequest({
      method: this.requestMethods.eth_sendTransaction,
      params: [rawTransaction],
    });
  } catch (error) {
    const revert = get(error, 'innerError.message', '').split('execution reverted: ')[1];
    if (revert) {
      error.message = revert;
    }
    console.error('[Web3Provider][transaction]', method, error, error.innerError);
    throw error;
  }
};

/**
 * Add a token to MetaMask
 * @param token {object}
 * @returns {Promise.<void>}
 */
export async function addTokenToWallet(token) {
  try {
    await this.fetchEthereumRequest({
      method: this.requestMethods.wallet_watchAsset,
      params: {
        type: 'ERC20',
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals || 18,
          image: token.logoURI || token.image,
        },
      },
    });
  } catch (error) {
    console.error('[addTokenToWallet]', error);
  }
}

/**
 * Wait for transaction receipt
 * @param txHash {string} - transaction hash
 * @returns {Promise.<*>} will returns a result when the transaction will be finished
 */
export async function getTransactionReceipt(txHash) {
  try {
    const receipt = await this.eth.getTransactionReceipt(txHash);
    if (receipt) return receipt;
    await wait(1000);
    return await this.getTransactionReceipt(txHash);
  } catch (error) {
    console.error('[getTransactionReceipt]', error);
    return null;
  }
}

/**
 * Update single pool data
 * @param pool {object}
 * @returns {Promise.<*>}
 */
export async function updatePoolData(pool) {
  if (!this.state.isConnected) return;
  try {
    const farm = this.getFarmContract();
    const addon = {};
    const poolData = await farm.getPoolData(pool);
    addon[poolData.address] = poolData;
    this.setState({
      pools: {
        ...this.state.pools,
        ...addon,
      }
    });
    return poolData;
  } catch (error) {
    await wait(AWAITING_DELAY);
    return await this.updatePoolData();
  }
};

/**
 * Update all pools data
 * @returns {Promise.<*>}
 */
export async function updatePoolsData() {
  if (!this.state.isConnected) return;
  try {
    const {pools} = this.state;
    const farm = this.getFarmContract();
    const settings = await farm.contract.methods.getSettings().call();
    const data = await Promise.all(Object.keys(pools).map(address => farm.getPoolData(pools[address])));
    const poolsWithData = {};
    data.map((pool, index) => {
      data[index].rewardPerBlock = wei.to(wei.from(settings.uintRewardPerBlock) * data[index].share);
      poolsWithData[pool.address] = data[index];
    });
    this.setState({pools: poolsWithData});
  } catch (error) {
    await wait(AWAITING_DELAY);
    return await this.updatePoolsData();
  }
};

/**
 * Update pools list
 * @returns {Promise.<*>}
 */
export async function updatePoolsList() {
  if (!this.state.isConnected) return;
  try {
    const farm = this.getFarmContract();
    const pools = await farm.getPoolsList();
    this.setState({pools});
    return await this.updatePoolsData();
  } catch (error) {
    await wait(AWAITING_DELAY);
    return await this.updatePoolsList();
  }
};

/**
 * Asks user to switch a networkApi
 * @param chainId {number} - networkApi chain id
 * @param firstAttempt {bool} - is there is a first call
 * @returns {Promise.<*>}
 */
export async function switchToChain(chainId, firstAttempt = true) {
  if (firstAttempt) this.requiredChain = chainId;
  if (firstAttempt && this.state.chainId !== chainId) {
    this.setState({pools: null})
  }
  try {
    if (chainId === 19) {
      await this.fetchEthereumRequest({
        method: this.requestMethods.wallet_addEthereumChain,
        params: [{
          chainId: toHex(19),
          chainName: 'Songbird',
          nativeCurrency: {
            name: 'Songbird',
            symbol: 'SGB',
            decimals: 18
          },
          rpcUrls: ['https://songbird-api.flare.network/ext/bc/C/rpc'],
          blockExplorerUrls: ['https://songbird-explorer.flare.network']
        }],
      });
    }
    await this.fetchEthereumRequest({
      method: this.requestMethods.wallet_switchEthereumChain,
      params: [{chainId: toHex(chainId)}]
    });
    return true;
  } catch (error) {
    console.error('[switchToChain]', error);
    
    toaster.warning(`Switch to chain ${get(NETWORKS_DATA[chainId], 'title', '')}`);
    if (this.requiredChain === chainId) {
      // return await this.switchToChain(chainId, false);
    }
  }
}

/**
 * Returns blocks per second value and updates it in the state
 * @returns {Promise.<void>}
 */
export async function getBlocksPerSecond() {
  if (!this.eth) return;
  try {
    const currentBlockNumber = toNumber(await this.eth.getBlockNumber());
    const data = await Promise.all([
      this.eth.getBlock(currentBlockNumber),
      this.eth.getBlock(currentBlockNumber - 10000),
    ]);
    const blocksPerSecond = toNumber(data[0].number - data[1].number)
      / toNumber(data[0].timestamp - data[1].timestamp);
    this.setState({
      blocksPerSecond,
    });
    return blocksPerSecond;
  } catch (error) {
    console.error('[getBlocksPerSecond]', error);
  }
}

export async function updateFiats(symbol, rates) {
  // Clear fiat balances.
  this.setBalances([], 'fiats');
  try {
    const {accountAddress, chainId, isConnected} = this.state;
    const userId = `${chainId}${accountAddress}`;
    if (!isConnected) {
      const fiats = {};
      const fineFiats = KNOWN_FIATS.filter(
        (t) => t.chainId === this.network.chainId
      );
      fiats[userId] = fineFiats;
      fiats.known = fineFiats;
      this.setState({
        fiats,
      });
      return KNOWN_FIATS;
    }
    const fiats = cloneDeep(this.state.fiats);
    let list = get(fiats, 'list', []);
    
    if (!list.length) {
      const factoryContract = await this.getContract(
        require('const/ABI/fiatFactory'),
        this.network.contractAddresses.fiatFactory,
      );
      list = await factoryContract.methods.getFiats().call();
      fiats.list = list;
    }
    
    const userFiats = (await Promise.all(list.map(fiatAddress => {
      const fiatContract = new Contract(
        require('const/ABI/fiat'),
        fiatAddress,
      );
      fiatContract.setProvider(this.eth.currentProvider);
      return fiatContract.methods.getInfo(accountAddress || ZERO_ADDRESS).call();
    }))).map((fiat, index) => {
      const known = KNOWN_FIATS.filter(f => f.chainId === chainId)
        .find(s => s.symbol === fiat[1]);
      
      if (known) {
        const token = new FiatToken(
          fiat[0],
          fiat[1],
          list[index],
          chainId,
          18,
          known.logoURI
        );
        token.balance = fiat[2];
        
        return token;
      }
      
      return null;
    }).filter(f => !!f);
    fiats[userId] = userFiats;
    fiats.known = KNOWN_FIATS;
    this.setState({
      fiats,
      fiatsLoaded: true,
    });
    
    this.setBalances(userFiats.map((userFiat) => {
      let price = 0;
      if (rates) {
        const symbol = userFiat.symbol.toLowerCase();
        const rate = rates[symbol] || 0;
        
        price = symbol === 'usd' ? 1 : rate;
      }
      
      return {
        ...userFiat,
        price
      }
    }), 'fiats');
    
    return fiats;
  } catch (error) {
    console.error('[updateFiats]', error);
  }
}

// Get block from date.
export async function dateToBlockMoralis(date = new Date()) {
  // Date to unix timestamp.
  const unixDate = Math.floor(date.getTime() / 1000);
  
  // Moralis request data.
  const {headers, params, api} = this.moralis;
  
  return axios
    .get(`${api}/dateToBlock`, {
      headers,
      params: {
        ...params,
        date: unixDate,
      },
    })
    .then((r) => r.data.block);
};

// Get token price from contract (required), block (optional).
export async function getTokenPriceMoralis(contractAddress, toBlock = null) {
  const {headers, params, api} = this.moralis;
  
  return axios(`${api}/erc20/${contractAddress}/price`, {
    headers,
    params: {
      ...params,
      to_block: toBlock,
    },
  }).then((r) => r.data.usdPrice);
};

/**
 * Returns Token difference,
 * price from {timeFrom}, price from {timeTo}
 * @param address {string}
 * @param timeFrom {Date}
 * @param timeTo {Date}
 * @return {object} {difference, priceFrom, priceTo}
 */
export async function getSomeTimePricesPairMoralis(address, timeFrom, timeTo) {
  const blockFrom = await this.dateToBlockMoralis(timeFrom);
  const blockTo = timeTo ? await this.dateToBlockMoralis(timeTo) : null;
  
  // Get prices
  const priceTo = await this.getTokenPriceMoralis(address, blockTo ? blockTo : null);
  const priceFrom = await this.getTokenPriceMoralis(address, blockFrom);
  
  // Set price and difference
  const difference = Number((priceTo / (priceFrom / 100) - 100).toFixed(2));
  
  return {address, difference, priceFrom, priceTo};
}

/**
 * Send token from current address to receiver.
 * @param token {object} - token object
 * @param address {string} - receiver address
 * @param value {number} - send tokens amount
 * @return {string|null} - TX result.
 */
export async function sendTokens(token, address, value) {
  const amount = wei.to(String(value), token.decimals);
  if (!token.address || token.symbol === this.network.wrapToken.symbol) {
    const promises = await Promise.all([
      this.eth.getTransactionCount(this.state.accountAddress),
      this.eth.getGasPrice(),
      this.eth.estimateGas({
        to: address,
      })
    ]);
    const count = promises[0];
    const gasPrice = promises[1];
    const gasLimit = promises[2];
    
    const rawTransaction = {
      gasPrice: numberToHex(gasPrice),
      gasLimit: numberToHex(gasLimit),
      to: address,
      from: this.state.accountAddress,
      value: numberToHex(amount),
      chainId: numberToHex(this.state.chainId),
      nonce: numberToHex(count),
    };
    
    try {
      return await this.fetchEthereumRequest({
        method: this.requestMethods.eth_sendTransaction,
        params: [rawTransaction],
      });
    } catch (error) {
      console.error('[sendTokens]', error);
      return null;
    }
  }
  
  const params = [address, amount];
  
  try {
    const contract = this.getTokenContract(token).contract;
    const result = await this.transaction(contract, 'transfer', params);
    console.log('transaction', result);
    return result;
  } catch (error) {
    console.error('[sendTokens]', error);
    return null;
  }
}

export async function getChoosenTokens() {
  const {tokens, chainId} = this.state;
  
  const topCoingeckoCoins = await marketCoins();
  const topCoinsSymbols = topCoingeckoCoins.map((coin) => coin.symbol);
  const pancakeTokens = tokens.filter((t) => t.chainId === chainId);
  
  const topCoins = pancakeTokens.filter((token) => {
    return topCoinsSymbols.find(
      (coinSymbol) => token.symbol.toLowerCase() === coinSymbol.toLowerCase()
    );
  });
  
  // NRFX + other tokens.
  const fineCoins = topCoins.find((t) => t.symbol === 'NRFX')
    ? topCoins
    : [pancakeTokens[0], ...topCoins];
  
  // loadAccountBalances(accountAddress, fineCoins, false, true);
  return fineCoins;
}

 /**
 * Returns the best trade route for a pair of tokens
 * @param _pairs {array} - array of Pair type objects
 * @param token0 {object} - raw token object
 * @param token1 {object} - raw token object
 * @param amount {number} - amount in decimals
 * @param isExactIn {boolean} - set true if the amount is an exact amount of token0
 * @param maxHops {integer} - number of trade steps between the pair (1 for no steps) (default: 3)
 * @returns {Trade} - best trade
 */
 export async function getTrade(pairs, token0, token1, amount, isExactIn = true, maxHops = 3) {
  let bestTrade;
  for (let hops = 1; hops <= maxHops; hops++) {
    const tradeMethod = isExactIn ? Trade.bestTradeExactIn : Trade.bestTradeExactOut;
    const trade = get(tradeMethod(
      pairs,
      isExactIn
        ? this.getTokenAmount(token0, amount)
        : this.getToken(token0),
      isExactIn
        ? this.getToken(token1)
        : this.getTokenAmount(token1, amount),
      {maxNumResults: 1, maxHops: hops}
    ), '[0]');
    // Set the best trade
    if (hops === 1 || this.isTradeBetter(bestTrade, trade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
      bestTrade = trade;
    }
  }
  
  return bestTrade;
}

/**
 * Returns TokenAmount object
 * @param token {object} - raw token data
 * @param amount {number} - amount of tokens in decimals
 * @returns {TokenAmount}
 */
export function getTokenAmount(token, amount) {
  const amountWei = amount > Number.MAX_SAFE_INTEGER
    ? Number.MAX_SAFE_INTEGER
    : wei.to(amount, token.decimals);
  
  return new TokenAmount(this.getToken(token), amountWei);
}

/**
 * Returns Token type object
 * @param _token {object} - raw token data
 * @returns {TokenSDK}
 */
export function getToken(_token) {
  const token = _token.address ? _token : this.network.wrapToken;
  return new TokenSDK(
    token.chainId,
    token.address,
    token.decimals,
    token.symbol,
    token.name,
    token.projectLink,
  );
}

/**
 * Compares two trades by effectiveness
 * @param tradeA {Trade}
 * @param tradeB {Trade}
 * @param minimumDelta {Percent}
 * @returns {boolean} - true if tradeB is better
 */
export function isTradeBetter(tradeA, tradeB, minimumDelta) {
  if (tradeA && !tradeB) return false;
  if (tradeB && !tradeA) return true;
  if (!tradeA || !tradeB) return undefined;
  
  return tradeA.executionPrice
    .raw
    .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
    .lessThan(tradeB.executionPrice);
}

/**
 * Get fraction from number.
 * @param number {number}
 * @returns {Object} Fraction
 */
export function numberToFraction(number = 0) {
  // Number int to Fraction.
  const numberIntFraction = new Fraction(JSBI.BigInt(parseInt(number)));
  const numberRemainder = Number(String(number % 1).slice(2));
  const numberRemainderLength = String(numberRemainder).length;
  
  // Number remainder to Fraction.
  const numberRemainderFraction = new Fraction(
    JSBI.BigInt(numberRemainder),
    JSBI.BigInt(Math.pow(10, numberRemainderLength))
  );
  
  // Add sleppage int and remainder to one fraction.
  const result = numberIntFraction.add(numberRemainderFraction);
  return result;
}

export function fractionToHex(fraction, decimals) {
  toHex(wei.to(significant(fraction), decimals));
}

export async function removeCustomToken(_address) {
  const address = toChecksumAddress(_address);
  if (this.customTokens.find(t => t.address === address)) return;
  this.customTokens = this.customTokens.filter(t => t.address !== address);
  this.storage.set({customTokens: this.customTokens.map(token => {
      return Object.assign({}, token);
    })});
  this.updateStateCustomTokens();
}

// export async function getPastLogs(params) {
//   try {
//     return await this.eth.getPastLogs(params);
//   } catch (error) {
//     console.error('[getPastLogs]', error);
//   }
// }