export default class ExchangerStorage {
  name = 'dappExchanger';

  constructor() {
    this.storage = JSON.parse(window.localStorage.getItem(this.name)) || {};
  }

  set(items) {
    this.storage = { ...this.storage, ...items };
    window.localStorage.setItem(this.name, JSON.stringify(this.storage));
  }
}
