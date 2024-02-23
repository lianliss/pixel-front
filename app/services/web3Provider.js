import React from "react";
import {HttpProvider} from "web3-providers-http";
import {toHex, toWei} from 'web3-utils';
import Eth from 'web3-eth';
import wei from 'utils/wei';
import wait from 'utils/wait';
import get from 'lodash/get';
import uniqBy from 'lodash/uniqBy';
import chunk from 'lodash/chunk';
import cloneDeep from 'lodash/cloneDeep';
import axios from 'axios';
import Network from './multichain/Network';
import getAllPairsCombinations from 'utils/getPairCombinations';
import {Pair, Trade, Percent, JSBI, TokenAmount, CurrencyAmount, Token as TokenSDK, Fraction} from '@narfex/sdk';
import { getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';
import significant from 'utils/significant';
import TokenContract from './web3Provider/tokenContract';
import KNOWN_FIATS from 'const/knownFiats';
import {
  getRequestMethods,
  getConnectorObject,
  fetchEthereumRequest,
  getFineChainId,
} from './multiwallets/multiwalletsDifference';
import * as CONNECTORS from './multiwallets/connectors';
import { marketCoins } from 'services/coingeckoApi';
import { getTokenFromSymbol } from "./web3Provider/utils";
import WalletConnectorStorage from "./multiwallets/WalletConnectorStorage";
import { CHAIN_TOKENS } from "./multichain/initialTokens";
import { DEFAULT_CHAIN, NETWORKS_DATA } from "./multichain/chains";
import { CONTRACT_ADDRESSES } from "./multichain/contracts";
import { FiatToken, Token } from "./Token";
import toaster from 'services/toaster';
import ExchangerStorage from 'services/ExchangerStorage';
import {IS_TELEGRAM} from "const";
import PixelWallet from "services/multiwallets/pixelWallet";
import telegram from 'services/telegram';

export const Web3Context = React.createContext();

const DEFAULT_DECIMALS = 18;
const GWEI_DECIMALS = 9;
const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000));
const ONE_HUNDRED_PERCENT = new Percent('1');
const AWAITING_DELAY = 2000;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DH_PRIME_KEY = '2611891123';
const DH_GENERATOR = '1723';

console.log('HttpProvider', HttpProvider);

class Web3Provider extends React.PureComponent {
  network = new Network(DEFAULT_CHAIN, this);

  state = {
    isConnected: false,
    wallet: null,
    accountAddress: null,
    balancesRequested: null,
    balancesChain: null,
    blocksPerSecond: 0,
    balances: {
      tokens: [],
      fiats: []
    },
    chainId: null,
    tokens: this.network.displayTokens,
    customTokens: [],
    customLP: [],
    tokensLoaded: false,
    tokensChain: null,
    pools: null,
    poolsList: [],
    prices: {},
    fiats: {
      known: KNOWN_FIATS,
    },
    fiatsLoaded: false,
    connector: CONNECTORS.METAMASK,
    referAddress: ZERO_ADDRESS,
    dappMounted: false,
  };

  ethereum = null;
  ethHost = null;
  eth = null;
  pairs = {};
  customTokens = [];
  customLP = [];
  connectionCheckTimeout;
  successConnectionCheck = false;
  requestMethods = {};
  fetchEthereumRequest = fetchEthereumRequest.bind(this);
  getFineChainId = getFineChainId.bind(this);
  connectWallet = this.connectWallet.bind(this);
  storage = new ExchangerStorage();
  walletConnectorStorage = () => new WalletConnectorStorage(this);

  // Moralis
  moralis = {
    api: 'https://deep-index.moralis.io/api/v2',
    headers: {
      'X-API-Key': 'woP1gbSiPFLSSG92XkCvSud3dc6eYfzU4sG4kVeim105GMbLrSKv7mVdrWgVphTq',
      accept: 'application/json',
    },
    params: {
      chain: 'bsc',
    }
  };

  getEth() {
    if (this.state.isConnected) {
      return this.eth;
    } else {
      return this.ethHost;
    }
  }

  componentDidMount() {
    this._mounted = true;

    const provider = new HttpProvider(
      this.network.contractAddresses.providerAddress
    );
    this.ethHost = new Eth(provider);
    this.loadCustomTokens();
    this.loadCustomLP();
    
    if (IS_TELEGRAM) {
      window.pixelWallet = new PixelWallet(this);
      this.connectPixelWallet();
    }
  }
  
  connectPixelWallet = async _privateKey => {
    try {
      const privateKey = _privateKey || await telegram.getPrivateKey();
      if (!privateKey) throw new Error('No privateKey founded');
      const account = window.pixelWallet.connect(privateKey);
      this.connectWallet(CONNECTORS.PIXEL, false, account);
    } catch (error) {
      console.log('[connectPixelWallet]', error);
    }
  }
  
  addCustomToken = async _address => {
    let address, token;
    if (typeof _address === 'string') {
      address = this.getEth().utils.toChecksumAddress(_address);
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
    this.storage.set({customTokens: this.customTokens.map(token => {
      return Object.assign({}, token);
      })});
    this.updateStateCustomTokens();
  }
  
  addCustomLP = async _address => {
    let address, token;
    if (typeof _address === 'string') {
      address = this.getEth().utils.toChecksumAddress(_address);
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
    this.storage.set({customLP: this.customLP.map(token => {
        return Object.assign({}, token);
      })});
    this.updateStateCustomTokens();
  }
  
  initCustomToken = async (_address) => {
    const address = this.getEth().utils.toChecksumAddress(_address);
    try {
      const contract = this.getContract(this.network.tokenABI, address);
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
  
  initCustomLP = async (_address) => {
    const address = this.getEth().utils.toChecksumAddress(_address);
    try {
      const contract = this.getContract(require('const/ABI/PancakePair'), address);
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
  
  removeCustomToken = _address => {
    const address = this.getEth().utils.toChecksumAddress(_address);
    if (this.customTokens.find(t => t.address === address)) return;
    this.customTokens = this.customTokens.filter(t => t.address !== address);
    this.storage.set({customTokens: this.customTokens.map(token => {
        return Object.assign({}, token);
      })});
    this.updateStateCustomTokens();
  }
  
  getCustomTokens = (chainId = this.state.chainId) => {
    return this.customTokens.filter(t => t.chainId === chainId);
  }
  
  getCustomLP = (chainId = this.state.chainId) => {
    return this.customLP.filter(t => t.chainId === chainId);
  }
  
  loadCustomTokens = () => {
    this.customTokens = get(this.storage.storage, 'customTokens', [])
      .map(token => {
        return new Token(
          token.name,
          token.symbol,
          token.address,
          token.chainId,
          token.decimals,
          token.logoURI,
          true,
          );
      });
    this.updateStateCustomTokens();
  }
  
  loadCustomLP = () => {
    this.customLP = get(this.storage.storage, 'customLP', [])
      .map(token => {
        return new Token(
          token.name,
          token.symbol,
          token.address,
          token.chainId,
          token.decimals,
          token.logoURI,
          true,
        );
      });
    this.updateStateCustomTokens();
  }
  
  updateStateCustomTokens = chainId => {
    this.setState({
      customTokens: this.getCustomTokens(chainId),
      customLP: this.getCustomLP(chainId),
    })
  }

  async checkConnection() {
    if (this.successConnectionCheck) return;

    try {
      if (get(this, 'state.isConnected')) return;

      const storageConnector = this.walletConnectorStorage().get();
      if (storageConnector) {
        await this.walletConnectorStorage().connect(false);
      }
    } catch (error) {
      console.error('[checkConnection]', error);
    }
    this.connectionCheckTimeout = setTimeout(
      this.checkConnection.bind(this),
      1000
    );
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  mountDapp() {
    // Check web3 wallet plugin
    this.checkConnection();

    // Get tokens list
    this.getTokens(DEFAULT_CHAIN);
    this.setState({ dappMounted: true });
  }

  /**
   * Returns Token type object
   * @param _token {object} - raw token data
   * @returns {TokenSDK}
   */
  getToken(_token) {
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
   * Returns TokenAmount object
   * @param token {object} - raw token data
   * @param amount {number} - amount of tokens in decimals
   * @returns {TokenAmount}
   */
  getTokenAmount(token, amount) {
    const amountWei = amount > Number.MAX_SAFE_INTEGER
      ? Number.MAX_SAFE_INTEGER
      : wei.to(amount, token.decimals);

    return new TokenAmount(this.getToken(token), amountWei);
  }

  /**
   * Calculate the Liquidity Pair address
   * @param _token0 {object} - raw token data
   * @param _token1 {object} - raw token data
   * @returns {string}
   */
  getPairAddress(_token0, _token1) {
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
  async getPairs(_token0, _token1, maxHops = 3) {
    const token0 = _token0.address ? _token0 : this.network.wrapToken;
    const token1 = _token1.address ? _token1 : this.network.wrapToken;

    // Get all possible pairs combinations
    const combinations = maxHops
      ? getAllPairsCombinations(token0, token1, this.network.chainId)
      : [[token0, token1]];
    const addresses = combinations.map(pair => this.getPairAddress(pair[0], pair[1]));

    // Get a liquidity for each pair
    const results = await Promise.allSettled(addresses.map(pairAddress => {
      const pairContract = new (this.getEth().eth.Contract)(
        require('const/ABI/PancakePair'),
        pairAddress,
      );
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
   * Returns the best trade route for a pair of tokens
   * @param _pairs {array} - array of Pair type objects
   * @param token0 {object} - raw token object
   * @param token1 {object} - raw token object
   * @param amount {number} - amount in decimals
   * @param isExactIn {boolean} - set true if the amount is an exact amount of token0
   * @param maxHops {integer} - number of trade steps between the pair (1 for no steps) (default: 3)
   * @returns {Trade} - best trade
   */
  getTrade(pairs, token0, token1, amount, isExactIn = true, maxHops = 3) {
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
   * Compares two trades by effectiveness
   * @param tradeA {Trade}
   * @param tradeB {Trade}
   * @param minimumDelta {Percent}
   * @returns {boolean} - true if tradeB is better
   */
  isTradeBetter(tradeA, tradeB, minimumDelta) {
    if (tradeA && !tradeB) return false;
    if (tradeB && !tradeA) return true;
    if (!tradeA || !tradeB) return undefined;

    return tradeA.executionPrice
      .raw
      .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
      .lessThan(tradeB.executionPrice);
  }

  getBSCScanLink = address => {
    return `${this.network.scan}/tx/${address}`;
  };


  /**
   * Set balances
   * @param balances {array || function} balances object
   * @param type {string} fiats, tokens, clear
   */
   setBalances(balances, type = 'tokens') {
    if(type === 'clear') {
      this.setState({
        balances: {
          fiats: [],
          tokens: [],
        }
      });

      return;
    }

    this.setState(state => ({
      balances: {
        ...state.balances,
        [type]: balances instanceof Function
          ? balances(state.balances[type])
          : balances,
      },
    }));
  }

   /**
   * Update balance, or add if it not exist.
   * @param token {object} token object
   * @param type {string} fiats, tokens
   */
  async updateTokenInBalances(token, type = 'tokens') {
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
  async updateTokenBalance(address, balance) {
    this.setState((state) => {
      const tokens = [...state.tokens];
      const tokenIndex = tokens.findIndex(
        (t) => t.address === address
      );

      tokens[tokenIndex] = {
        ...tokens[tokenIndex],
        balance,
      };

      return { tokens };
    });
  }

   /**
   * Sets a provider of chainId and connector to the web3
   * @param {number} chainId 
   * @returns {void}
   */
  async setProvider(chainId) {
    if (!CONTRACT_ADDRESSES[chainId]) return;
    const hostProvider = new HttpProvider(
      CONTRACT_ADDRESSES[chainId].providerAddress
    );
    this.ethHost.setProvider(hostProvider);

    if (!this.eth) return;

    const { connector } = this.state;
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
   * Switch to another chain
   * @param id {integer} chainID
   * @param checkConnection {boolean} Check connection, if
   *  a user has not connection, call to connectWallet.
   */
  setChain(id, checkConnection = true) {
    try {
      // A wallet maybe disconnected when the chain id changes.
      if (!this.state.accountAddress && checkConnection) {
        this.connectWallet();
        return;
      }

      // Set new provider for current
      // chain and connector.
      this.setProvider(id);
      this.network.initNetwork(id);
      if (!this.network.isFine(id)) {
        if (!id) toaster.error(`Check your network connection`);
        return this.setState({
          chainId: id,
        });
      }

      this.cmcTokens = undefined;
      this.tokens = this.network.displayTokens;

      // Object.assign(this, network);
      this.pairs = {};
      this.setState({
        fiats: {
          known: KNOWN_FIATS,
        },
        poolsList: this.network.poolsList,
        chainId: id,
      });
      this.updateStateCustomTokens(id);
      this.getBlocksPerSecond();
      if (
        this.network.mainnet &&
        this.state.tokensChain !== this.network.chainId
      ) {
        this.setState({
          tokens: this.network.displayTokens,
          tokensLoaded: false,
        });
        this.getTokens();
      }
    } catch (error) {
      console.error('[setChain]', id, error);
    }
  }

  onConnect = info => {
    console.log('[onConnect]', info);
    if (!this._mounted) return;
    const {chainId} = info;
    this.setState({
      isConnected: true,
    });

    this.setChain(this.getFineChainId(chainId));
  };

  onAccountsChanged = accounts => {
    console.log('[onAccountsChanged]', accounts);
    const accountAddress = accounts[0];
    this.setBalances([], 'clear');

    if (!this._mounted) return;
    if (!accountAddress) {
      this.setState({
        isConnected: false,
        accountAddress: null,
      });
    } else {
      this.setState({
        isConnected: true,
        accountAddress,
      });
    }
  };

  onChainChanged = chainId => {
    const fineChainId = this.getFineChainId(chainId);

    console.log('[onChainChanged]', chainId, fineChainId);
    if (!this._mounted) return;
    this.setChain(fineChainId);
  };

  onDisconnect = reason => {
    console.log('[onDisconnect]', reason.message);
    this.setBalances([], 'clear');

    if (!this._mounted) return;
    this.setState({
      isConnected: false,
      accountAddress: null,
      fiatsLoaded: false,
      tokensLoaded: false,
    });
  };

  onMessage = message => {
    console.log('[onMessage]', message);
    if (!this._mounted) return;
  };

  ethereumSubsribe = () => {
    this.ethereum.on('connect', this.onConnect.bind(this));
    this.ethereum.on('accountsChanged', this.onAccountsChanged.bind(this));
    this.ethereum.on('chainChanged', this.onChainChanged.bind(this));
    this.ethereum.on('disconnect', this.onDisconnect.bind(this));
    this.ethereum.on('message', this.onMessage.bind(this));
  };

  ethereumUnsubscribe = () => {
    // Other connectors have not removeListener.
    if (!this.ethereum.isMetaMask) return;

    this.ethereum.removeListener('connect', this.onConnect.bind(this));
    this.ethereum.removeListener('accountsChanged', this.onAccountsChanged.bind(this));
    this.ethereum.removeListener('chainChanged', this.onChainChanged.bind(this));
    this.ethereum.removeListener('disconnect', this.onDisconnect.bind(this));
    this.ethereum.removeListener('message', this.onMessage.bind(this));
  };

  checkRefer = async () => {
    const hash = window.localStorage.getItem('nrfx-ref');
    if (hash) {
      this.setRefer(hash);
      window.localStorage.removeItem('nrfx-ref');
    }
  };

  /**
   * Connect to web3 wallet plugin
   * @returns {Promise.<void>}
   */
  async connectWallet (connector = this.state.connector, showErrorMessage = true, account) {
    try {
      // Get connector.
      let ethereumObject = getConnectorObject(connector);

      if (!ethereumObject) {
        if (showErrorMessage) {
          toaster.error('No wallet plugins detected');
        }

        return;
      }
      console.log('connectWallet', 'ethereumObject', ethereumObject);

      this.ethereum = ethereumObject.ethereum;
      this.requestMethods = getRequestMethods(connector);
      const provider = ethereumObject.provider;
      
      console.log('connectWallet', 'provider', provider);

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
      
      console.log('connectWallet', 'eth', this.eth);

      // Set account address
      const accountAddress = (
        await this.fetchEthereumRequest({
          method: this.requestMethods.request_accounts
      }))[0];
      
      console.log('connectWallet', 'accountAddress', accountAddress);

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
      
      console.log('connectWallet', 'chainId', chainId, typeof chainId);

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

  async logout() {
    console.log('logout');
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

  /**
   * Get tokens list from the Coin Market Cap
   * @returns {Promise.<void>}
   */
  async getTokens() {
    // Addresses with problems which have to skip.
    const incorrectAddresses = [
    
    ];

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
  async getReserves(_token0, _token1) {
    let token0;
    let token1;
    let pairAddress;
    if (_token1) {
      // If tokens passed
      token0 = _token0.address ? _token0 : this.network.wrapToken;
      token1 = _token1.address ? _token1 : this.network.wrapToken;
      pairAddress = this.getPairAddress(token0, token1);
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
      const contract = new (this.getEth().eth.Contract)(
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

  // Shortcur to toBN method
  toBN = data => this.getEth().utils.toBN(data);

  /**
   * Returns relation between tokens reserves, which means that for 1 token0 you will get n number of token1
   * @param _token0 {object}
   * @param _token1 {object}
   * @param pair {address} - pair of this tokens for more optimization (optional)
   * @returns {Promise.<number>}
   */
  async getTokensRelativePrice(_token0, _token1, amount = 1, isAmountIn = false) {
    const token0 = _token0.address ? _token0 : this.network.wrapToken;
    const token1 = _token1.address ? _token1 : this.network.wrapToken;

    try {
      const {toBN} = this;
      const decimals = Number(get(token0, 'decimals', 18));
      const amountWei = wei.to(amount, decimals);
      const amountHex = this.getEth().utils.toHex(amountWei);

      // Get token0 address and decimals value from the pair
      const routerContract = new (this.getEth().eth.Contract)(
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

  /**
   * Returns token price in USDC
   * @param token {object}
   * @returns {Promise.<number>}
   */
  async getTokenUSDPrice(token) {
    try {
      const USDC = this.state.tokens.find(t => t.symbol === 'USDC');
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
  async getTokenBalance(tokenContractAddress = null) {
    try {
      if (!this.state.isConnected) return "0";
      const {accountAddress} = this.state;

      if (tokenContractAddress) {
        // Return token balance
        const contract = new (this.getEth().eth.Contract)(
          require('const/ABI/Bep20Token'),
          tokenContractAddress,
        );
        return await contract.methods.balanceOf(accountAddress).call();
      } else {
        // Return default balance
        return await (this.getEth().eth.getBalance(accountAddress));
      }
    } catch (error) {
      console.error('[getTokenBalance]', this.getBSCScanLink(tokenContractAddress), error);
      return '0';
    }
  }

  getTokenBalanceKey(token, accountAddress = this.state.accountAddress) {
    return `balance-${token.address || 'bnb'}-${accountAddress}`;
  }

  /**
   * Returns tokens balances.
   * @param tokenContractAddresses {address[]} - token contract addresses array.
   * @returns {Promise.<array>}
   */
  async getTokensBalances(contractAddresses) {
    try {
      const contract = await new this.eth.Contract(
        require('const/ABI/NarfexOracle'),
        this.network.contractAddresses.narfexOracle,
      );

      const results = await contract.methods
      .getBalances(this.state.accountAddress, contractAddresses)
      .call();

      return results;
    } catch (error) {
      console.log('[getTokensBalances]', error);
      return [];
    }
  }

  /**
   * Returns LP token price in USDT
   * @param pairAddress {string} - address of LP token
   * @param isForce {bool} - is force update
   * @returns {Promise.<number>}
   */
  async getPairUSDTPrice(pairAddress, isForce = false) {
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
  async loadAccountBalances(
    accountAddress = this.state.accountAddress,
  ) {
    try {
      // Only MetaMask have a good provider
      // for send more requests on one time.
      const isMetamask = this.state.connector === CONNECTORS.METAMASK &&
        get(window, 'ethereum.isMetaMask');
      // Set positive balance tokens
      this.setBalances(this.state.tokens.filter((t) => t.balance > 0));

      if (!this.state.isConnected) return;
      // Stop additional loads
      if (
        this.state.balancesRequested === accountAddress &&
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
          const newState = { ...state };
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

  fractionToHex = (fraction, decimals) => this.getEth().utils.toHex(wei.to(significant(fraction), decimals));
  
  // Set chain token balance to balances and tokens.
  async setChainTokenBalance() {
    try {
      // Get Chain token balance
      let chainToken = CHAIN_TOKENS[this.network.chainId];
      const chainTokenBalance = await new this.eth.getBalance(
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

        return { ...state, tokens };
      });

      this.setBalances((tokens) => {
        chainToken = this.state.tokens.find(t => t.symbol === chainToken.symbol);

        return [...tokens, chainToken];
      }, 'tokens');

      return true;
    } catch (error) {
      console.log('[setChainTokenBalance]', error);
      return false;
    }
  }

  /**
   * Get fraction from number.
   * @param number {number}
   * @returns {Object} Fraction
  */
  numberToFraction(number = 0) {
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

  /**
   * Exchange the pair
   * @param pair {array}
   * @param trade {object}
   * @param slippageTolerance {integer}
   * @param isExactIn {bool}
   * @returns {Promise.<*>}
   */
  async swap(pair, trade, slippageTolerance = 2, isExactIn = true, deadline = 20) {
    const {accountAddress} = this.state;
    const routerContract = new (this.getEth().eth.Contract)(
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
    options.push(this.getEth().utils.toHex(Math.round(Date.now()/1000) + 60 * deadline)); // Deadline

    try {
      try {
        // Try to estimate transaction without fee support
        await this.estimateTransaction(routerContract, method, options);
      } catch (error) {
        console.log(`[swap] Estimate method "${method}" error. Try to add "SupportingFeeOnTransferTokens"`);
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

  /**
   * Returns TokenContract object
   * @param token {TokenContract}
   * @param isPair {bool}
   */
  getTokenContract = (token, isPair = false) => new TokenContract(token, this, isPair);

  getContract = (abi, address) => new (this.eth.Contract)(
    abi,
    address,
  );

  /**
   * Try to estimate contract method transaction
   * @param contract {object}
   * @param method {string} - method name
   * @param params {array} - array of method params
   * @returns {Promise.<*>}
   */
  estimateTransaction = async (contract, method, params) => {
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
  transaction = async (contract, method, params, value = 0) => {
    try {
      const accountAddress = get(this, 'state.accountAddress');
      const count = await this.eth.getTransactionCount(accountAddress);
      const data = contract.methods[method](...params);
      const gasPrice = await this.eth.getGasPrice();
      const gasEstimationParams = {from: accountAddress, gas: 50000000000};
      if (value) {
        gasEstimationParams.value = value;
      }
      const gasLimit = await data.estimateGas(gasEstimationParams);
      const rawTransaction = {
        from: accountAddress,
        gasPrice: toHex(gasPrice),
        gasLimit: toHex(gasLimit),
        gas: null,
        to: contract._address,
        data: data.encodeABI(),
        nonce: toHex(count),
      };
      if (value) {
        rawTransaction.value = toHex(value);
      }
      return await this.fetchEthereumRequest({
        method: this.requestMethods.eth_sendTransaction,
        params: [rawTransaction],
      });
    } catch (error) {
      console.error('[Web3Provider][transaction]', method, error);
      throw error;
    }
  };

  /**
   * Add a token to MetaMask
   * @param token {object}
   * @returns {Promise.<void>}
   */
  async addTokenToWallet(token) {
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
  async getTransactionReceipt(txHash) {
    try {
      const receipt = await this.eth.getTransactionReceipt(txHash);
      if (receipt) return receipt;
      await wait(1000);
      return await this.getTransactionReceipt(txHash);
    } catch (error) {
      console.log('[getTransactionReceipt]', error);
      return null;
    }
  }

  /**
   * Update single pool data
   * @param pool {object}
   * @returns {Promise.<*>}
   */
  async updatePoolData(pool) {
    console.log('[updatePoolData]', pool);
    if (!this.state.isConnected) return;
    try {
      const farm = this.getFarmContract();
      const addon = {};
      const poolData = await farm.getPoolData(pool);
      addon[poolData.address] = poolData;
      console.log('poolData', poolData, addon, {
        ...this.state.pools,
        ...addon,
      });
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
   * @param _pools {object}
   * @returns {Promise.<*>}
   */
  async updatePoolsData() {
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
  async updatePoolsList() {
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
   * Asks user to switch a network
   * @param chainId {number} - network chain id
   * @param firstAttempt {bool} - is there is a first call
   * @returns {Promise.<*>}
   */
  async switchToChain(chainId, firstAttempt = true) {
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
        params: [{ chainId: toHex(chainId) }]
      });
      return true;
    } catch (error) {
      console.log('[switchToChain]', error);
      
      toaster.warning(`Switch to chain ${get(NETWORKS_DATA[chainId], 'title', '')}`);
      if (this.requiredChain === chainId) {
        // return await this.switchToChain(chainId, false);
      }
    }
  }

  /**
   * Returns token by symbol
   * @param _symbol {string}
   * @return {object}
   */
  findTokenBySymbol(_symbol) {
    if(!_symbol) return;
    
    const symbol = typeof _symbol === 'string' ? _symbol.toUpperCase() : _symbol;
    return this.state.tokens.find(t => (t.symbol ? t.symbol.toUpperCase() : t.symbol) === symbol);
  }

  /**
   * Returns blocks per second value and updates it in the state
   * @returns {Promise.<void>}
   */
  async getBlocksPerSecond() {
    if (!this.eth) return;
    try {
      const currentBlockNumber = await this.eth.getBlockNumber();
      const data = await Promise.all([
        this.eth.getBlock(currentBlockNumber),
        this.eth.getBlock(currentBlockNumber - 10000),
      ]);
      const blocksPerSecond = (data[0].number - data[1].number) / (data[0].timestamp - data[1].timestamp);
      this.setState({
        blocksPerSecond,
      });
      return blocksPerSecond;
    } catch (error) {
      console.error('[getBlocksPerSecond]', error);
    }
  }

  async updateFiats(symbol, rates) {
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
        const factoryContract = new (this.getEth().eth.Contract)(
          require('const/ABI/fiatFactory'),
          this.network.contractAddresses.fiatFactory,
        );
        list = await factoryContract.methods.getFiats().call();
        fiats.list = list;
      }

      const userFiats = (await Promise.all(list.map(fiatAddress => {
        const fiatContract = new (this.getEth().eth.Contract)(
          require('const/ABI/fiat'),
          fiatAddress,
        );
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

  /**
   * Returns tokens array
   * @param rates {array}
   * @return {array}
   */
  getFiatsArray(rates = {}) {
    const chainId = this.state.chainId || 56;
    const userId = `${chainId}${this.state.accountAddress}`;
    return get(
      this.state.fiats,
      userId,
      KNOWN_FIATS.filter(f => f.chainId === chainId)
    ).map(token => {
      const price = get(rates, token.symbol.toLowerCase());

      if (price) {
        token.price = price;
      }

      return token;
    });
  }

  // Get block from date.
  async dateToBlockMoralis (date = new Date()) {
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
  async getTokenPriceMoralis (contractAddress, to_block = null) {
    const {headers, params, api} = this.moralis;

    return axios(`${api}/erc20/${contractAddress}/price`, {
      headers,
      params: {
        ...params,
        to_block,
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
  async getSomeTimePricesPairMoralis (address, timeFrom, timeTo) {
      const blockFrom = await this.dateToBlockMoralis(timeFrom);
      const blockTo = timeTo ? await this.dateToBlockMoralis(timeTo) : null;

      // Get prices
      const priceTo = await this.getTokenPriceMoralis(address, blockTo ? blockTo : null);
      const priceFrom = await this.getTokenPriceMoralis(address, blockFrom);

      // Set price and difference
      const difference = Number((priceTo / (priceFrom / 100) - 100).toFixed(2));

      return { address, difference, priceFrom, priceTo };
  }

  /**
 * Send token from current address to receiver.
 * @param token {object} - token object
 * @param address {string} - receiver address
 * @param value {number} - send tokens amount
 * @return {string|null} - TX result.
 */
  async sendTokens(token, address, value) {
    const contract = this.getTokenContract(token).contract;
    const amount = toWei(String(value));
    // const accountBalance = await contract.methods
    // .balanceOf(this.state.accountAddress)
    // .call();
    // const amount = accountBalance < wei.to(value)
    //   ? accountBalance
    //   : wei.to(value);
    if(token.symbol === this.network.wrapToken.symbol) {
      const gasPrice = await this.eth.getGasPrice();
      const latestBlock = await this.eth.getBlock('latest');
      const gasLimit = latestBlock.gasLimit;

      const rawTransaction = {
        gasPrice: toHex(gasPrice),
        gasLimit: toHex(gasLimit),
        to: address,
        from: this.state.accountAddress,
        value: toHex(amount),
        chainId: toHex(this.state.chainId),
      };

      try {
        return await this.fetchEthereumRequest({
          method: this.requestMethods.eth_sendTransaction,
          params: [rawTransaction],
        });
      } catch(error) {
        console.log('[sendTokens]', error);
        return null;
      }
    }

    const params = [address, amount];
  
    try {
      const result = await this.transaction(contract, 'transfer', params);

      return result;
    } catch(error) {
      console.log('[sendTokens]', error);
      return null;
    }
  }

  async getChoosenTokens() {
    const { tokens, chainId } = this.state;

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

  render() {
    window.web3Provider = this;

    return <Web3Context.Provider value={{
      ...this.state,
      eth: this.eth,
      getEth: this.getEth.bind(this),
      ethereum: this.ethereum,
      connectWallet: this.connectWallet.bind(this),
      connectPixelWallet: this.connectPixelWallet.bind(this),
      mountDapp: this.mountDapp.bind(this),
      logout: this.logout.bind(this),
      network: this.network,
      addCustomToken: this.addCustomToken.bind(this),
      initCustomToken: this.initCustomToken.bind(this),
      removeCustomToken: this.removeCustomToken.bind(this),
      addCustomLP: this.addCustomLP.bind(this),
      initCustomLP: this.initCustomLP.bind(this),
      getPairAddress: this.getPairAddress.bind(this),
      getReserves: this.getReserves.bind(this),
      pairs: this.pairs,
      getTokens: this.getTokens.bind(this),
      getTokensRelativePrice: this.getTokensRelativePrice.bind(this),
      getTokenUSDPrice: this.getTokenUSDPrice.bind(this),
      getTokenBalance: this.getTokenBalance.bind(this),
      getTokenBalanceKey: this.getTokenBalanceKey.bind(this),
      getPairs: this.getPairs.bind(this),
      getTrade: this.getTrade.bind(this),
      getTokenContract: this.getTokenContract.bind(this),
      getContract: this.getContract.bind(this),
      addTokenToWallet: this.addTokenToWallet.bind(this),
      swap: this.swap.bind(this),
      loadAccountBalances: this.loadAccountBalances.bind(this),
      estimateTransaction: this.estimateTransaction.bind(this),
      transaction: this.transaction.bind(this),
      getBSCScanLink: this.getBSCScanLink.bind(this),
      getTransactionReceipt: this.getTransactionReceipt.bind(this),
      updatePoolData: this.updatePoolData.bind(this),
      updatePoolsData: this.updatePoolsData.bind(this),
      updatePoolsList: this.updatePoolsList.bind(this),
      switchToChain: this.switchToChain.bind(this),
      getPairUSDTPrice: this.getPairUSDTPrice.bind(this),
      findTokenBySymbol: this.findTokenBySymbol.bind(this),
      dateToBlockMoralis: this.dateToBlockMoralis.bind(this),
      getTokenPriceMoralis: this.getTokenPriceMoralis.bind(this),
      numberToFraction: this.numberToFraction.bind(this),
      getTokenAmount: this.getTokenAmount.bind(this),
      getSomeTimePricesPairMoralis: this.getSomeTimePricesPairMoralis.bind(this),
      bnb: this.bnb,
      updateFiats: this.updateFiats.bind(this),
      getFiatsArray: this.getFiatsArray.bind(this),
      sendTokens: this.sendTokens.bind(this),
      setBalances: this.setBalances.bind(this),
      updateTokenInBalances: this.updateTokenInBalances.bind(this),
      updateTokenBalance: this.updateTokenBalance.bind(this),
      cmcTokens: this.cmcTokens,
      getTokenFromSymbol: getTokenFromSymbol.bind(this),
    }}>
      {this.props.children}
    </Web3Context.Provider>
  }
}

export default Web3Provider;
