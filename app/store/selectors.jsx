import get from 'lodash/get';
export const adaptiveSelector = state => get(state, 'App.adaptive');
export const gaslessSelector = state => get(state, 'App.gasless');
export const ratesSelector = state => get(state, 'Dapp.rates');
export const isHideMenuButtonSelector = state => get(state, 'App.isHideMenuButton');
export const dappExchangeAmountSelector = focus => state => get(state, `Dapp.exchange.${focus}.amount`, 0);
export const dappExchangeTokenSelector = focus => state => get(state, `Dapp.exchange.${focus}.token`);
export const dappExchangeFocusSelector = state => state.Dapp.exchange.focus;
export const dappSwapSelector = (state) => state.Dapp.swap;


