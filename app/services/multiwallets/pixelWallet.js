import {DEFAULT_CHAIN, SONGBIRD} from "services/multichain/chains";
import {
  privateKeyToAccount,
  Transaction,
  signTransaction,
  sign,
  Common,
} from 'web3-eth-accounts';

let pKey;

class PixelWallet {
  selectedAddress = null;
  networkVersion = DEFAULT_CHAIN;
  chainId = '0x' + DEFAULT_CHAIN.toString(16);
  
  constructor(web3Provider, provider) {
    this.eth = web3Provider.ethHost;
    this.provider = provider;
    this.web3 = web3Provider;
  }
  
  connect(privateKey) {
    pKey = privateKey;
    const account = privateKeyToAccount(privateKey);
    this.selectedAddress = account.address;
    this.sign = data => sign(data, privateKey);
    this.signTransaction = (tx) => signTransaction(tx, privateKey);
    this.encrypt = account.encrypt;
    return account;
  }
  
  sign = async (data) => {
    console.error('[PixelWallet][sign] Wallet is not connected');
  }
  
  signTransaction = async (tx) => {
    console.error('[PixelWallet][signTransaction] Wallet is not connected');
  }
  
  encrypt = (password) => {
    console.error('[PixelWallet][encrypt] Wallet is not connected');
  }
  
  listeners = {
    connect: [],
    accountsChanged: [],
    chainChanged: [],
    disconnect: [],
    message: [],
  };
  
  emit = (eventName, params) => {
    console.log('[PixelWaller][emit]', eventName, params, this.listeners[eventName]);
    this.listeners[eventName].map(callback => {
      callback(params);
    })
  }
  
  on = (eventType, callback) => {
    const listeners = this.listeners[eventType];
    if (!listeners.find(l => l === callback)) {
      listeners.push(callback);
    }
  }
  
  removeListener = (eventType, callback) => {
    this.listeners[eventType] = this.listeners[eventType]
      .filter(l => l !== callback);
  }
  
  request = async ({method, params = []}) => {
    try {
      switch (method) {
        case 'eth_requestAccounts':
          return [this.selectedAddress]
        case 'eth_sendTransaction':
          const common = Common.custom({chainId: this.networkVersion});
          const tx = new Transaction(params[0],{common});
          const signed = await this.signTransaction(tx);
          return await this.web3.ethHost.sendSignedTransaction(signed.rawTransaction)
        case 'personal_sign':
          return this.sign(params[0]).signature;
        case 'wallet_switchEthereumChain':
          this.chainId = params[0].chainId;
          this.networkVersion = Number(params[0].chainId);
          this.eth = this.web3.ethHost;
          this.emit('chainChanged', params[0].chainId);
          return true;
        case 'wallet_addEthereumChain':
        default:
          return null;
      }
    } catch (error) {
      console.error('[PixelWallet][request]', method, error);
      throw error;
    }
  }
  
}

export default PixelWallet;
