import _ from 'lodash';

export const getTokenFromSymbol = function (symbol) {
  const fiats = this.getFiatsArray();
  const tokens = this.state.tokens;

  return [...fiats, ...tokens].find((coin) => {
    if (!_.isFunction(coin.symbol.toLowerCase)) return;
    if (!_.isFunction(symbol.toLowerCase)) return;

    return coin.symbol.toLowerCase() === symbol.toLowerCase();
  });
};
