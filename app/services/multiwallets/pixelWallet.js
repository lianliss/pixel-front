import {DEFAULT_CHAIN, SONGBIRD} from "services/multichain/chains";
import {
  privateKeyToAccount,
  Transaction,
  signTransaction,
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
  }
  
  connect(privateKey) {
    pKey = privateKey;
    const account = privateKeyToAccount(privateKey);
    console.log('account', account);
    this.selectedAddress = account.address;
    this.sign = account.sign;
    this.signTransaction = (tx) => signTransaction(tx, privateKey);
    this.encrypt = account.encrypt;
    return account;
  }
  
  sign = async (data) => {
    console.log('[PixelWallet][sign] Wallet is not connected');
  }
  
  signTransaction = async (tx) => {
    console.log('[PixelWallet][signTransaction] Wallet is not connected');
  }
  
  encrypt = (password) => {
    console.log('[PixelWallet][encrypt] Wallet is not connected');
  }
  
  request = async ({method, params = []}) => {
    console.log('[request]', method, params);
    try {
      switch (method) {
        case 'eth_requestAccounts':
          return [this.selectedAddress]
        case 'eth_sendTransaction':
          const common = Common.custom({chainId: this.networkVersion});
          const tx = new Transaction(params[0],{common});
          const signed = await this.signTransaction(tx);
          const result = await this.eth.sendSignedTransaction(signed.rawTransaction)
          console.log('[request] result', result);
          return result;
        default:
          return null;
      }
    } catch (error) {
      console.error('[PixelWallet][request]', method, error);
      throw error;
    }
  }
  
  on(event, callback) {
  
  }
  
}

export default PixelWallet;
