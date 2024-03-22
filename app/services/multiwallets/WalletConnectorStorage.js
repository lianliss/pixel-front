class WalletConnectorStorage {
  storageName = 'walletConnector';

  constructor(provider) {
    this.connector = window.localStorage.getItem(this.storageName);
    this.connectWallet = provider.connectWallet;
  }

  set(connector = null) {
    if (connector) {
      window.localStorage.setItem(this.storageName, connector);
    }
  }

  clear() {
    window.localStorage.removeItem(this.storageName);
  }

  get() {
    return this.connector;
  }

  /**
   * Connect wallet if previously used
   * connect function.
   * @param showErrorMessage {boolean} - Display error message
   * in toast if can't connect.
   * Returns response of connectWallet.
   */
  async connect(showErrorMessage = true) {
    if (!this.connector) return;

    const connected = await this.connectWallet(this.connector, showErrorMessage);
    return connected;
  }
}

export default WalletConnectorStorage;
