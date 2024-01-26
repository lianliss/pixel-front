import * as CONNECTORS from './connectors';

export default {
  [CONNECTORS.METAMASK]: {
    request_accounts: 'eth_requestAccounts',
    eth_sendTransaction: 'eth_sendTransaction',
    wallet_watchAsset: 'wallet_watchAsset',
    wallet_addEthereumChain: 'wallet_addEthereumChain',
    wallet_switchEthereumChain: 'wallet_switchEthereumChain',
    personal_sign: 'personal_sign',
  },
  [CONNECTORS.BSC]: {
    request_accounts: 'eth_accounts',
    eth_sendTransaction: 'eth_sendTransaction',
    wallet_watchAsset: null,
    wallet_addEthereumChain: 'wallet_addEthereumChain',
    wallet_switchEthereumChain: 'wallet_switchEthereumChain',
    personal_sign: 'personal_sign',
  },
  [CONNECTORS.TRUST_WALLET]: {
    request_accounts: 'eth_requestAccounts',
    eth_sendTransaction: 'eth_sendTransaction',
    wallet_watchAsset: null,
    wallet_addEthereumChain: 'wallet_switchEthereumChain',
    wallet_switchEthereumChain: 'wallet_switchEthereumChain',
    personal_sign: 'personal_sign',
  },
  [CONNECTORS.WALLET_CONNECT]: {
    request_accounts: 'eth_accounts',
    eth_sendTransaction: 'eth_sendTransaction',
    wallet_watchAsset: null,
    wallet_addEthereumChain: 'wallet_addEthereumChain',
    wallet_switchEthereumChain: 'wallet_switchEthereumChain',
    personal_sign: 'personal_sign',
  },
  [CONNECTORS.OKX_WALLET]: {
    request_accounts: 'eth_requestAccounts',
    eth_sendTransaction: 'eth_sendTransaction',
    wallet_watchAsset: 'wallet_watchAsset',
    wallet_addEthereumChain: 'wallet_addEthereumChain',
    wallet_switchEthereumChain: 'wallet_switchEthereumChain',
    personal_sign: 'personal_sign',
  },
};
