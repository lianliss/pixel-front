import React from 'react';

// Components
import {Icon} from '@blueprintjs/core';
import { Button } from 'ui';
import Currency from './components/Currency/Currency';
import ExchangeRoute from './components/ExchangeRoute/ExchangeRoute';
import ExchangerSettings from './components/ExchangerSettings/ExchangerSettings';

// Utils
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { adaptiveSelector} from "app/store/selectors";
import getFinePrice from 'utils/getFinePrice';
import { useSwapAction } from "app/hooks/useSwap";

// Styles
import './ExchangerModal.scss';

function ExchangerModal({ ...props }) {
  const adaptive = useSelector(adaptiveSelector);
  const { fiat, coin, fiatAmount, coinAmount, isExactOut } = props;
  const swapAction = useSwapAction({
    fiat,
    coin,
    fiatAmount,
    coinAmount,
    isExactOut,
  });

  const ListItem = ({ title, value }) => (
    <div
      className="ExchangerModal-ListItem"
      justifyContent="space-between"
      alignItems="center"
    >
      <div className="ExchangerModal-ListItem__title">{title}</div>
      <div className="ExchangerModal-ListItem__value">{value}</div>
    </div>
  );

  const SwapButton = () => (
    <Button
      onClick={() => swapAction.setIsRateReverse(!swapAction.isRateReverse)}
      className="swap"
      icon={"swap-horizontal"}
    />
  );

  return (
    <div className="ExchangerModal">
      <div className="ExchangerModal__container">
        <h3>Exchange</h3>
        <div className="ExchangerModal__Currency__container">
          <span>{"You give"}</span>
          <Currency
            adaptive={adaptive}
            name={swapAction.networkName}
            currency={swapAction.fiat}
            amount={swapAction.inAmount}
          />
        </div>
        <div className="ExchangerModal__Currency__container">
          <span>{"You receive"}</span>
          <Currency
            adaptive={adaptive}
            name={swapAction.networkName}
            currency={swapAction.coin}
            amount={swapAction.outAmount}
          />
        </div>
        <div className="ExchangerModal__rate">
          <ListItem
            title={"Rate"}
            value={
              <>
                <span>
                  {getFinePrice(
                    swapAction.isRateReverse
                      ? 1 / swapAction.rate
                      : swapAction.rate
                  )}
                  &nbsp;
                  {
                    (swapAction.isRateReverse
                      ? swapAction.fiat
                      : swapAction.coin
                    ).symbol
                  }
                  &nbsp;{"per"}
                  &nbsp;
                  {
                    (swapAction.isRateReverse
                      ? swapAction.coin
                      : swapAction.fiat
                    ).symbol
                  }
                </span>
                <SwapButton />
              </>
            }
          />
        </div>
        <div>
          {!swapAction.isAvailable && (
            <Button
              type="lightBlue"
              size="extra_large"
              onClick={() => swapAction.approve()}
              state={swapAction.isApproving ? 'loading' : ''}
              className="exchange"
            >
              Approve
            </Button>
          )}
          <Button
            type="lightBlue"
            size="extra_large"
            onClick={() => swapAction.swap()}
            disabled={!swapAction.isAvailable}
            state={swapAction.isProcess ? 'loading' : ''}
            className="exchange"
          >
            Swap
          </Button>
        </div>
        <div>
          <div>
            <div>
              {swapAction.isExactOut
                ? 'Maximum spend'
                : 'Minimum receive'}
            </div>
            <span>
              {getFinePrice(swapAction.isExactOut
                ? swapAction.inAmountMax
                : swapAction.outAmountMin)}
              &nbsp;
              {swapAction.isExactOut
                ? swapAction.fiat.symbol
                : swapAction.coin.symbol}
            </span>
          </div>
          <div>
            <div>
              {"Price impact"}
            </div>
            <span className={swapAction.priceImpactColor}>
              {getFinePrice(swapAction.priceImpactPercents)} %
            </span>
          </div>
        </div>
        <ExchangeRoute route={swapAction.path.map((token) => token.symbol)} />
        <ExchangerSettings
          {...{
            slippage: swapAction.slippage,
            setSlippage: swapAction.setSlippage,
            deadline: swapAction.deadline,
            setDeadline: swapAction.setDeadline,
          }}
        />
      </div>
    </div>
  );
}

export default ExchangerModal;
