import {isFunction} from 'lodash';

export const getTokenFromSymbol = function (symbol) {
  const fiats = this.getFiatsArray();
  const tokens = this.state.tokens;

  return [...fiats, ...tokens].find((coin) => {
    if (!isFunction(coin.symbol.toLowerCase)) return;
    if (!isFunction(symbol.toLowerCase)) return;

    return coin.symbol.toLowerCase() === symbol.toLowerCase();
  });
};
