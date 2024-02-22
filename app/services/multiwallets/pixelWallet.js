import {DEFAULT_CHAIN} from "services/multichain/chains";

class PixelWallet {
  selectedAddress = null;
  networkVersion = DEFAULT_CHAIN;
  chainId = '0x' + DEFAULT_CHAIN.toString(16);
  
  constructor(web3Provider) {
    this.web3 = web3Provider.web3Host;
  }
  
  connect(privateKey) {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    this.selectedAddress = account.address;
    this.sign = account.sign;
    this.signTransaction = account.signTransaction;
    this.encrypt = account.encrypt;
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
