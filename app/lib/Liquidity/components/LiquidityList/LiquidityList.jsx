import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  DoubleWallets, WalletIcon,
  DropdownElement, Button,
} from 'ui';
import {Icon} from '@blueprintjs/core';
import {get} from 'lodash';
import { Web3Context } from 'services/web3Provider';

// Utils
import { classNames as cn } from 'utils';
import wei from 'utils/wei';
import getFinePrice from 'utils/getFinePrice';

// Styles
import './LiquidityList.scss';

let updateBalanceInterval;
const UPDATE_BALANCE_TIMEOUT = 5000;

// Main
function LiquidityList({ onAddClick, onRemoveClick, poolsList, emptyText }) {
  const context = React.useContext(Web3Context);
  const { getReserves, getTokenContract, accountAddress, chainId, customLP } = context;
  const [pools, setPools] = React.useState([]);
  const [balances, setBalances] = React.useState({});
  
  const updateBalance = () => {
    if (accountAddress) {
      Promise.allSettled(poolsList.map((address) => getReserves(address))).then(
        (data) => {
          setPools(data.map((d) => get(d, 'value[2]')).filter((d) => d));
        }
      );
      Promise.allSettled(
        poolsList.map((address) =>
          getTokenContract(
            {
              address,
              decimals: 18,
            },
            true
          ).getBalance()
        )
      ).then((data) => {
        const balances = {};
        data.map((b, i) => {
          const address = poolsList[i];
          balances[address] = b.value;
        });
        setBalances(balances);
      });
    }
  };

  React.useEffect(() => {
    if (!accountAddress) return;
    updateBalance();
    // clearInterval(updateBalanceInterval);
    // setInterval(updateBalance, UPDATE_BALANCE_TIMEOUT);
    // return () => {
    //   clearInterval(updateBalanceInterval);
    // }
  }, [poolsList, accountAddress, chainId]);

  const ItemContent = ({ item }) => {
    const symbol0 = get(item, 'token0.symbol', '');
    const symbol1 = get(item, 'token1.symbol', '');
    const decimals0 = get(item, 'token0.decimals', 18);
    const decimals1 = get(item, 'token1.decimals', 18);
    const reserve0 = wei.from(item[symbol0] || '0', decimals0);
    const reserve1 = wei.from(item[symbol1] || '0', decimals1);
    const totalSupply = wei.from(get(item, 'totalSupply', '0'));
    const balance = balances[item.address];
    const share = totalSupply ? balance / totalSupply : 0;
    const userAmount0 = reserve0 * share;
    const userAmount1 = reserve1 * share;

    return (
      <div className="ItemContent">
        <div className="ItemContent__body">
          <div>
            <span>
              Pooled {item.token0.symbol}
            </span>
            <span>
              <span>{getFinePrice(userAmount0)}</span>
              <WalletIcon currency={item.token0} size={16} />
            </span>
          </div>
          <div>
            <span>
              Pooled {item.token1.symbol}
            </span>
            <span>
              <span>{getFinePrice(userAmount1)}</span>
              <WalletIcon currency={item.token1} size={16} />
            </span>
          </div>
          <div>
            <span>{"Your LP tokens"}:</span>
            <span>{getFinePrice(balance)}</span>
          </div>
          <div>
            <span>{"Your share"}:</span>
            <span>{getFinePrice(share * 100)}%</span>
          </div>
        </div>
        <div className="ItemContent__footer">
          <Button
            type="lightBlue"
            size="extra_large"
            onClick={() => onAddClick(item.address)}
          >
            Add
          </Button>
          <Button
            type="dark"
            disabled={!balance}
            size="extra_large"
            onClick={() => onRemoveClick(item.address)}
          >
            Remove
          </Button>
        </div>
      </div>
    );
  };

  return (
    <ul className={cn('LiquidityList', { empty: !pools.length })}>
      {pools.length ? (
        pools.map((item, index) => (
          <li key={index} className="LiquidityList__item">
            <DropdownElement dropElement={<ItemContent item={item} />}>
              <div className="LiquidityList__item__container">
                <DoubleWallets
                  first={item.token0}
                  second={item.token1}
                  pair={item}
                />
                <div className="dropdown-icon">
                  <Icon icon={"chevron-down"} />
                </div>
              </div>
            </DropdownElement>
          </li>
        ))
      ) : (
        <li></li>
      )}
    </ul>
  );
}

LiquidityList.propTypes = {
  emptyText: PropTypes.string,
  onAddClick: PropTypes.func,
  onRemoveClick: PropTypes.func,
};

LiquidityList.defaultProps = {
  emptyText: 'dapp_liquidity_list_no_liquidity',
  onAddClick: () => {},
  onRemoveClick: () => {},
};

export default LiquidityList;
