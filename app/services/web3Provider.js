import React from "react";
import get from 'lodash/get';
import Network from 'services/multichain/Network';
import TokenContract from './web3Provider/tokenContract';
import KNOWN_FIATS from 'const/knownFiats';
import * as CONNECTORS from 'services/multiwallets/connectors';
import WalletConnectorStorage from "services/multiwallets/WalletConnectorStorage";
import { DEFAULT_CHAIN } from "services/multichain/chains";
import { Token } from "./web3Provider/Token";
import toaster from 'services/toaster';
import ExchangerStorage from 'services/ExchangerStorage';
import {getTokenFromSymbol} from './web3Provider/utils';
import {TelegramContext} from "services/telegramProvider";

export const Web3Context = React.createContext();

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

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
  signs = {};
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
    
    this.initEtherMethods().then(() => {
      this.initProvider();
    });
  }
  
  initEtherMethods = async () => {
    if (!this.methodsPromise) {
      this.methodsPromise = new Promise((fulfill, reject) => {
        import('./web3Provider/methods').then(methods => {
          Object.keys(methods).map(name => {
            const field = methods[name];
            if (typeof field === 'function') {
              this[name] = field.bind(this);
            } else {
              this[name] = field;
            }
          });
          fulfill();
        })
      })
    }
    return await this.methodsPromise;
  }
  
  connectPixelWallet = async _privateKey => {
    await this.initEtherMethods();
    return await this.connectPixelWallet(_privateKey);
  }
  
  addCustomToken = async _address => {
    await this.initEtherMethods();
    return await this.addCustomToken(_address);
  }
  
  addCustomLP = async _address => {
    await this.initEtherMethods();
    return await this.addCustomLP(_address);
  }
  
  initCustomToken = async (_address) => {
    await this.initEtherMethods();
    return await this.initCustomToken(_address);
  }
  
  initCustomLP = async (_address) => {
    await this.initEtherMethods();
    return await this.initCustomLP(_address);
  }
  
  removeCustomToken = async (_address) => {
    await this.initEtherMethods();
    return await this.removeCustomToken(_address);
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
    await this.initEtherMethods();

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
   * Calculate the Liquidity Pair address
   * @param _token0 {object} - raw token data
   * @param _token1 {object} - raw token data
   * @returns {Promise.<void>}
   */
  getPairAddress = async (_token0, _token1) => {
    await this.initEtherMethods();
    return await this.getPairAddress(_token0, _token1);
  }

  /**
   * Returns all available pairs for trade between two tokens with their liquidity
   * @param _token0 {object} - raw token data
   * @param _token1 {object} - raw token data
   * @returns {Promise.<void>}
   */
  async getPairs(_token0, _token1, maxHops = 3) {
    await this.initEtherMethods();
    return await this.getPairs(_token0, _token1, maxHops);
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
  async getTrade(pairs, token0, token1, amount, isExactIn = true, maxHops = 3) {
    await this.initEtherMethods();
    return await this.getTrade(pairs, token0, token1, amount, isExactIn, maxHops);
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
     await this.initEtherMethods();
     return await this.updateTokenInBalances(token, type);
  }

  /**
   * Add to state new token object with balance.
   * @param {string} address
   * @param {string} balance
   */
  async updateTokenBalance(address, balance) {
    await this.initEtherMethods();
    return await this.updateTokenBalance(address, balance);
  }

   /**
   * Sets a provider of chainId and connector to the web3
   * @param {number} chainId 
   * @returns {void}
   */
  async setProvider(chainId) {
     await this.initEtherMethods();
     return await this.setProvider(chainId);
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

      // Object.assign(this, networkApi);
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
    await this.initEtherMethods();
    return await this.connectWallet(connector, showErrorMessage, account);
  }

  async logout() {
    await this.initEtherMethods();
    return await this.logout();
  }

  /**
   * Get tokens list from the Coin Market Cap
   * @returns {Promise.<void>}
   */
  async getTokens() {
    await this.initEtherMethods();
    return await this.getTokens();
  }

  /**
   * Returns current pair reserves
   * @param _token0 {object|address} Token object or pair address
   * @param _token1 {object|undefined} Token object or undefined if the pair address passed
   * @returns {Promise.<*>}
   */
  async getReserves(_token0, _token1) {
    await this.initEtherMethods();
    return await this.getReserves(_token0, _token1);
  }

  /**
   * Returns relation between tokens reserves, which means that for 1 token0 you will get n number of token1
   * @param _token0 {object}
   * @param _token1 {object}
   * @param pair {address} - pair of this tokens for more optimization (optional)
   * @returns {Promise.<number>}
   */
  async getTokensRelativePrice(_token0, _token1, amount = 1, isAmountIn = false) {
    await this.initEtherMethods();
    return await this.getReserves(_token0, _token1, amount, isAmountIn);
  }

  /**
   * Returns token price in USDC
   * @param token {object}
   * @returns {Promise.<number>}
   */
  async getTokenUSDPrice(token) {
    await this.initEtherMethods();
    return await this.getTokenUSDPrice(token);
  }

  /**
   * Returns tokens balance on the current account
   * @param tokenContractAddress {address} - token contract address.
   * Can be undefined. In that case the method will return BNB balance
   * @returns {Promise.<*>}
   */
  async getTokenBalance(tokenContractAddress = null) {
    await this.initEtherMethods();
    return await this.getTokenBalance(tokenContractAddress);
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
    await this.initEtherMethods();
    return await this.getTokensBalances(contractAddresses);
  }

  /**
   * Returns LP token price in USDT
   * @param pairAddress {string} - address of LP token
   * @param isForce {bool} - is force update
   * @returns {Promise.<number>}
   */
  async getPairUSDTPrice(pairAddress, isForce = false) {
    await this.initEtherMethods();
    return await this.getPairUSDTPrice(pairAddress, isForce);
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
    await this.initEtherMethods();
    return await this.loadAccountBalances(accountAddress);
  }
  
  // Set chain token balance to balances and tokens.
  async setChainTokenBalance() {
    await this.initEtherMethods();
    return await this.setChainTokenBalance();
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
    await this.initEtherMethods();
    return await this.swap(pair, trade, slippageTolerance, isExactIn, deadline);
  }

  /**
   * Returns TokenContract object
   * @param token {TokenContract}
   * @param isPair {bool}
   */
  getTokenContract = (token, isPair = false) => new TokenContract(token, this, isPair);

  getContract = async (abi, address) => {
    await this.initEtherMethods();
    return await this.getContract(abi, address);
  };

  /**
   * Try to estimate contract method transaction
   * @param contract {object}
   * @param method {string} - method name
   * @param params {array} - array of method params
   * @returns {Promise.<*>}
   */
  estimateTransaction = async (contract, method, params) => {
    await this.initEtherMethods();
    return await this.swap(contract, method, params);
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
    await this.initEtherMethods();
    return await this.swap(contract, method, params, value);
  };

  /**
   * Add a token to MetaMask
   * @param token {object}
   * @returns {Promise.<void>}
   */
  async addTokenToWallet(token) {
    await this.initEtherMethods();
    return await this.addTokenToWallet(token);
  }

  /**
   * Wait for transaction receipt
   * @param txHash {string} - transaction hash
   * @returns {Promise.<*>} will returns a result when the transaction will be finished
   */
  async getTransactionReceipt(txHash) {
    await this.initEtherMethods();
    return await this.getTransactionReceipt(txHash);
  }

  /**
   * Update single pool data
   * @param pool {object}
   * @returns {Promise.<*>}
   */
  async updatePoolData(pool) {
    await this.initEtherMethods();
    return await this.updatePoolData(pool);
  };

  /**
   * Update all pools data
   * @returns {Promise.<*>}
   */
  async updatePoolsData() {
    await this.initEtherMethods();
    return await this.updatePoolsData();
  };

  /**
   * Update pools list
   * @returns {Promise.<*>}
   */
  async updatePoolsList() {
    await this.initEtherMethods();
    return await this.updatePoolsList();
  };

  /**
   * Asks user to switch a networkApi
   * @param chainId {number} - networkApi chain id
   * @param firstAttempt {bool} - is there is a first call
   * @returns {Promise.<*>}
   */
  async switchToChain(chainId, firstAttempt = true) {
    await this.initEtherMethods();
    return await this.switchToChain(chainId, firstAttempt);
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
    await this.initEtherMethods();
    return await this.getBlocksPerSecond();
  }

  async updateFiats(symbol, rates) {
    await this.initEtherMethods();
    return await this.updateFiats(symbol, rates);
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
    await this.initEtherMethods();
    return await this.dateToBlockMoralis(date);
  };

  // Get token price from contract (required), block (optional).
  async getTokenPriceMoralis (contractAddress, toBlock = null) {
    await this.initEtherMethods();
    return await this.getTokenPriceMoralis(contractAddress, toBlock);
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
    await this.initEtherMethods();
    return await this.getSomeTimePricesPairMoralis(address, timeFrom, timeTo);
  }

  /**
 * Send token from current address to receiver.
 * @param token {object} - token object
 * @param address {string} - receiver address
 * @param value {number} - send tokens amount
 * @return {string|null} - TX result.
 */
  async sendTokens(token, address, value) {
    await this.initEtherMethods();
    return await this.sendTokens(token, address, value);
  }
  
  async backendRequest(path, params, method, additionalOptions) {
    await this.initEtherMethods();
    return await this.backendRequest(path, params, method, additionalOptions);
  }
  
  async getChoosenTokens() {
    await this.initEtherMethods();
    return await this.getChoosenTokens();
  }
  
  async getPastLogs(params) {
    await this.initEtherMethods();
    return await this.eth.getPastLogs(params);
  }
  
  async getBlockNumber() {
    await this.initEtherMethods();
    return await this.eth.getBlockNumber();
  }
  
  async apiGetTelegramUser(isForce) {
    await this.initEtherMethods();
    const params = {}
    if (isForce) {
      params.isForce = true;
    }
    return await this.backendRequest('mining', params);
  }
  
  async apiGetTelegramFriends() {
    await this.initEtherMethods();
    return await this.backendRequest('mining/children');
  }
  
  async apiGetGasless() {
    await this.initEtherMethods();
    return await this.backendRequest('mining/gasless');
  }
  
  async apiGetHistory() {
    await this.initEtherMethods();
    const response = await this.backendRequest('history');
    return response.message === 'OK'
      ? response.result.filter(e => e.input.length <= 2)
      : []
  }
  
  async apiGetTokenHistory(tokenAddress) {
    await this.initEtherMethods();
    const response = await this.backendRequest('history/token', {tokenAddress});
    return response.message === 'OK'
      ? response.result
      : []
  }
  
  async apiGetRewardsLogs() {
    await this.initEtherMethods();
    return await this.backendRequest('history/logs/rewards');
  }
  
  async apiClaim() {
    await this.initEtherMethods();
    return await this.backendRequest('mining/claim', {}, 'post');
  }
  
  async apiGetQuests() {
    await this.initEtherMethods();
    return await this.backendRequest('quests');
  }
  
  async apiCheckQuests() {
    await this.initEtherMethods();
    return await this.backendRequest('quests/checked');
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
      getPastLogs: this.getPastLogs.bind(this),
      getBlockNumber: this.getBlockNumber.bind(this),
      apiGetTelegramUser: this.apiGetTelegramUser.bind(this),
      apiGetTelegramFriends: this.apiGetTelegramFriends.bind(this),
      apiGetHistory: this.apiGetHistory.bind(this),
      apiGetTokenHistory: this.apiGetTokenHistory.bind(this),
      apiGetRewardsLogs: this.apiGetRewardsLogs.bind(this),
      apiClaim: this.apiClaim.bind(this),
      apiGetGasless: this.apiGetGasless.bind(this),
      apiGetQuests: this.apiGetQuests.bind(this),
      apiCheckQuests: this.apiCheckQuests.bind(this),
    }}>
      {this.props.children}
    </Web3Context.Provider>
  }
}

export default Web3Provider;
