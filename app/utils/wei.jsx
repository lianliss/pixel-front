const Web3 = require('web3/dist/web3.min.js');

const web3 = new Web3();
const DEFAULT_DECIMALS = 18;

const wei = {
  from: (bigNumber, decimals = DEFAULT_DECIMALS) => {
    const value = Number(web3.utils.fromWei(bigNumber));
    return value * 10 ** (DEFAULT_DECIMALS - decimals);
  },
  to: (value, decimals = DEFAULT_DECIMALS) => {
    return web3.utils.toWei(
      Number(value / 10 ** (DEFAULT_DECIMALS - decimals)).toFixed(
        DEFAULT_DECIMALS
      )
    );
  },
  bn: web3.utils.toBN,
};

module.exports = wei;
