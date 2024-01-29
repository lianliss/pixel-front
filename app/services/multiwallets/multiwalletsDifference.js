//import WalletConnectProvider from '@walletconnect/web3-provider';
import * as CONNECTORS from './connectors';
import requests from './requests';
import _ from 'lodash';
import {
  DEFAULT_CHAIN,
  ETHEREUM_MAINNET,
  BSC_MAINNET,
  BSC_TESTNET,
  POLYGON_MAINNET,
  ARBITRUM_MAINNET,
  SONGBIRD,
  //FLARE,
} from '../multichain/chains';

export const noderealRPC = {
  [ETHEREUM_MAINNET]:
    'https://rpc.ankr.com/eth/6c2f34a42715fa4c50762b0069a7a658618c752709b7db32f7bfe442741117eb',
  [BSC_MAINNET]:
    'https://rpc.ankr.com/bsc/6c2f34a42715fa4c50762b0069a7a658618c752709b7db32f7bfe442741117eb',
  [BSC_TESTNET]:
    'https://bsc-testnet.nodereal.io/v1/38d2b41600d44427ac26d968efff647a',
  [POLYGON_MAINNET]:
    'https://rpc.ankr.com/polygon/6c2f34a42715fa4c50762b0069a7a658618c752709b7db32f7bfe442741117eb',
  [ARBITRUM_MAINNET]:
    'https://rpc.ankr.com/arbitrum/6c2f34a42715fa4c50762b0069a7a658618c752709b7db32f7bfe442741117eb',
  //[FLARE]: 'https://flare-api.flare.network/ext/bc/C/rpc',
  [SONGBIRD]: 'https://songbird-api.flare.network/ext/bc/C/rpc',
};

/**
 * Returns ethereum request methods for wallet.
 * @param connector {string} - Wallet connector name from constant.
 * @returns {object}
 */
export const getRequestMetods = (connector) => {
  return requests[connector];
};

/**
 * @param {string} wallet - Wallet in the window.
 * @param {string[]} validationArray - Validation string
 *   in wallet. Example "isMetamask"
 * @returns {boolean} the wallet is valid.
 */
export const walletIsValid = (wallet, validationArray) =>
  validationArray.some((validation) =>
    _.get(window, `${wallet}.${validation}`)
  );

/**
 * Returns ethereum object of connector.
 * @param connector {string} - Wallet connector name from constant.
 * @returns {object}
 */
export const getEthereum = (connector, chainID = DEFAULT_CHAIN) => {
  switch (connector) {
    case CONNECTORS.BSC: {
      if (!window['BinanceChain']) {
        return null;
      }

      return window['BinanceChain'];
    }
    case CONNECTORS.METAMASK: {
      if (!window['ethereum']) {
        return null;
      }

      return window['ethereum'];
    }
    case CONNECTORS.TRUST_WALLET: {
      const isTrustWallet = walletIsValid('trustwallet', [
        'isTrust',
        'isTrustWallet',
      ]);

      if (isTrustWallet) {
        return window['trustwallet'];
      }

      if (window['ethereum']) {
        return window['ethereum'];
      }

      return null;
    }
    // case CONNECTORS.WALLET_CONNECT: {
    //   const walletConnect = new WalletConnectProvider({
    //     chainId: chainID,
    //     rpc: noderealRPC,
    //   });
    //
    //   return walletConnect;
    // }
    case CONNECTORS.OKX_WALLET: {
      const isOKXWallet = walletIsValid('okxwallet', [
        'isOkxWallet',
        'isOKExWallet',
      ]);
      const isEthereumOKX = walletIsValid('ethereum', [
        'isOkxWallet',
        'isOKExWallet',
      ]);

      if (isOKXWallet) {
        return window['okxwallet'];
      }

      if (isEthereumOKX) {
        return window['ethereum'];
      }

      return null;
    }
    default:
      return null;
  }
};

/**
 * Returns provider for web3(provider) of connector and ethereum.
 * @param connector {string} - Wallet connector name from constant.
 * @param ethereum {object} - ethereum object. May get with getEthereum(*).
 * @param chainID {number} - current network chainID - 56 mainnet, 97 testnet.
 * @returns {object}
 */
const getProviderOfConnector = (
  connector,
  ethereum,
  chainID = DEFAULT_CHAIN
) => {
  let provider = noderealRPC[chainID];

  switch (connector) {
    case CONNECTORS.BSC:
      break;
    default:
      provider = ethereum;
      break;
  }

  return provider;
};

/**
 * Returns ethereum object.
 * @param connector {string} - Wallet connector name from constant.
 * @returns {object}
 */
export const getConnectorObject = (connector, chainID = DEFAULT_CHAIN) => {
  const ethereum = getEthereum(connector, chainID);

  if (!ethereum) {
    return null;
  }

  if (connector === CONNECTORS.METAMASK && !ethereum.isMetaMask) {
    return null;
  }

  if (
    connector === CONNECTORS.TRUST_WALLET &&
    !(ethereum.isTrustWallet || ethereum.isTrust)
  ) {
    return null;
  }

  const provider = getProviderOfConnector(connector, ethereum, chainID);
  return { ethereum, provider };
};

/**
 * Returns ethereum fetch result.
 * @param requestObject {object} - ethereum request object.
 * @returns {Promise.<*>} - Fetch result.
 */
export const fetchEthereumRequest = async function (requestObject, ethereum) {
  if (!requestObject.method) return false;
  if (!this && !ethereum) return false;

  return await this.ethereum.request(requestObject);
};

/**
 * Returns chainId number for currency wallet connector.
 * @param id {number | string} - chain id in number or hex.
 * @returns {number} - fine chainId.
 */
export const getFineChainId = function (id) {
  if (!this) return null;
  if (!id) return null;

  // If id is hex, use hexToNumber
  // Else just set id in Number type.
  if (String(id).search('x') >= 0 && !_.isNumber(id)) {
    return this.getWeb3().utils.hexToNumber(id);
  }

  return Number(id);
};

/**
 * Returns current browser connector type.
 * @returns {string}
 */
export const getCurrentConnector = () => {
  if (_.get(window, 'ethereum.isMetaMask')) {
    return CONNECTORS.METAMASK;
  }

  if (
    _.get(window, 'trustwallet.isTrustWallet') ||
    _.get(window, 'ethereum.isTrustWallet') ||
    _.get(window, 'trustwallet.isTrust') ||
    _.get(window, 'ethereum.isTrust')
  ) {
    return CONNECTORS.TRUST_WALLET;
  }

  return CONNECTORS.WALLET_CONNECT;
};
