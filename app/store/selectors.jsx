import _ from 'lodash';
export const adaptiveSelector = state => _.get(state, 'App.adaptive');
export const ratesSelector = state => _.get(state, 'Dapp.rates');
export const dappExchangeAmountSelector = focus => state => _.get(state, `Dapp.exchange.${focus}.amount`, 0);
export const dappExchangeTokenSelector = focus => state => _.get(state, `Dapp.exchange.${focus}.token`);
export const dappExchangeFocusSelector = state => state.Dapp.exchange.focus;
export const dappSwapSelector = (state) => state.Dapp.swap;


