import {DEFAULT_CHAIN, SONGBIRD} from "services/multichain/chains";
import {privateKeyToAccount} from 'web3-eth-accounts';

class PixelWallet {
  selectedAddress = null;
  networkVersion = DEFAULT_CHAIN;
  chainId = '0x' + DEFAULT_CHAIN.toString(16);
  
  constructor(web3Provider) {
    this.eth = web3Provider.ethHost;
  }
  
  connect(privateKey) {
    const account = privateKeyToAccount(privateKey);
    this.selectedAddress = account.address;
    this.sign = account.sign;
    this.signTransaction = account.signTransaction;
    this.encrypt = account.encrypt;
    return account;
  }
  
  sign = (data) => {
    console.log('[PixelWallet][sign] Wallet is not connected');
  }
  
  signTransaction = (tx) => {
    console.log('[PixelWallet][signTransaction] Wallet is not connected');
  }
  
  encrypt = (password) => {
    console.log('[PixelWallet][encrypt] Wallet is not connected');
  }
  
  request = async ({method, params = []}) => {
    try {
      switch (method) {
        case 'eth_requestAccounts':
          return [this.selectedAddress]
        case 'eth_sendTransaction':
        
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
