const {fromWei, toWei, toBigInt} = require('web3-utils');

const DEFAULT_DECIMALS = 18;

const wei = {
  from: (bigNumber, decimals = DEFAULT_DECIMALS) => {
    const value = Number(fromWei(bigNumber, "ether"));
    return value * 10 ** (DEFAULT_DECIMALS - decimals);
  },
  to: (value, decimals = DEFAULT_DECIMALS) => {
    return toWei(
      Number(value / 10 ** (DEFAULT_DECIMALS - decimals)).toFixed(
        DEFAULT_DECIMALS
      ),
      "ether"
    );
  },
  bn: toBigInt,
};

module.exports = wei;
