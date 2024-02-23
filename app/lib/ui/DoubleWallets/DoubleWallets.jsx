import React from 'react';
import PropTypes from 'prop-types';
import { Web3Context } from 'services/web3Provider';
import {get} from 'lodash';

// Styles
import './DoubleWallets.scss';

function DoubleWallets({ first, second, pair, disableSymbols, size }) {
  const context = React.useContext(Web3Context);
  const { tokens, network } = context;
  const { wrapToken, defaultSymbol } = network;
  // const [symbol0, setSymbol0] = React.useState(first.symbol);
  // const [symbol1, setSymbol1] = React.useState(second.symbol);
  const [token0, setToken0] = React.useState(get(pair, 'token0', first));
  const [token1, setToken1] = React.useState(get(pair, 'token1', second));
  const containerSize = size && size * 2 - size * 2 * 0.1956;
  const sizeStyles = {
    width: size,
    height: size,
  };

  React.useEffect(() => {}, [first, second, pair]);

  const logo0 = token0.logoURI;
  const logo1 = token1.logoURI;
  
  let symbol0, symbol1;
  if (!disableSymbols) {
    symbol0 = token0.symbol === wrapToken.symbol ? defaultSymbol : token0.symbol;
    symbol1 = token1.symbol === wrapToken.symbol ? defaultSymbol : token1.symbol;
  }

  return (
    <div className="DoubleWallets">
      <div className="DoubleWallets__icons" style={{ width: containerSize }}>
        <div
          className="DoubleWallets__icon"
          style={{ backgroundImage: `url('${logo0}')`, ...sizeStyles }}
        />
        <div
          className="DoubleWallets__icon"
          style={{ backgroundImage: `url('${logo1}')`, ...sizeStyles }}
        />
      </div>
      {!disableSymbols && (
        <span>
          {symbol0 || '???'}
          {!!(token0 && token1) && '-'}
          {symbol1 || '???'}
        </span>
      )}
    </div>
  );
}

DoubleWallets.propTypes = {
  first: PropTypes.any,
  second: PropTypes.any,
  pair: PropTypes.any,
};

DoubleWallets.defaultProps = {
  first: '',
  second: '',
};

export default DoubleWallets;
