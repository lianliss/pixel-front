import React from 'react';
import PropTypes from 'prop-types';

// Components
import {WalletIcon} from 'ui';
import getFinePrice from 'utils/getFinePrice';

// Styles
import './Currency.scss';

function Currency({ currency, amount, name, adaptive }) {
  return (
    <div className="ExchangerModal__Currency" alignItems="center">
      <WalletIcon size={adaptive ? 35 : 41} currency={currency} />
      <span className="Number">
        {getFinePrice(amount)}
      </span>
      <div>
        <span className="ExchangerModal__Currency-name">{currency.name}</span>
        <span className="ExchangerModal__Currency-currency">{currency.symbol}</span>
      </div>
    </div>
  );
}

Currency.propTypes = {
  currency: PropTypes.string,
  amount: PropTypes.number,
  name: PropTypes.string,
};

export default Currency;
