import React from 'react';
import getFinePrice from 'utils/getFinePrice';
import useSwap from 'app/hooks/useSwap';
import {ModalContext} from "services/ModalProvider/ModalProvider";
import get from 'lodash/get';

// Components
import {Icon, Overlay} from '@blueprintjs/core';
import { Button } from 'ui';
import TokenSelect from 'lib/Exchanger/components/TokenSelect/TokenSelect';
import DappInput from 'lib/Exchanger/components/DappInput/DappInput';

// Styles
import './ExchangerSwap.scss';
import {IS_TELEGRAM} from "const";
import telegram from 'services/telegram';

function ExchangerSwap({
  fiats,
  fiat,
  coins,
  coin,
  setFiat,
  setCoin,
  fiatsLoaded,
}) {
  const {
    connectToWalletModal,
    exchangerModal,
  } = React.useContext(ModalContext);
  const {
    isAdaptive,
    fiatSelector,
    coinSelector,
    outputRate,
    fiatBalance,
    fiatAmount,
    coinAmount,
    fiatValue,
    handleCoinInput,
    handleFiatInput,
    isProcessing,
    isExactOut,
    isNoLiquidity,
    isSelectFiat,
    isSelectCoin,
    setIsSelectFiat,
    setIsSelectCoin,
    handleExchangeFocus,
    handleFiatChange,
    handleCoinChange,
    context,
  } = useSwap({
    fiats,
    fiat,
    coins,
    coin,
    setFiat,
    setCoin,
    fiatsLoaded,
  });
  const fiatSymbol = get(fiat, 'symbol', '');
  const coinSymbol = get(coin, 'symbol', '');
  
  React.useEffect(() => {
    if (!IS_TELEGRAM) return;
    telegram.setMainButton({
      text: isNoLiquidity
        ? 'No liquidity found'
        : 'Swap',
      isDisabled: !fiatAmount || !coinAmount,
      isLoading: isProcessing,
      onClick: () =>
        exchangerModal({
          isExactOut,
          fiat,
          coin,
          fiatAmount,
          coinAmount,
        }),
    });
    
    return () => {
      telegram.hideMainButton();
    }
  }, [fiatAmount, coinAmount, isProcessing, isNoLiquidity]);

  return (
    <div className={`ExchangerSwap ${isAdaptive && 'adaptive'}`}>
      <div className="SwapForm__formWrapper">
        <div className="SwapForm__form">
          <div className="SwapForm__form__control">
            <div className="ExchangerSwap__dropdown" onClick={fiatSelector}>
              <div
                className="ExchangerSwap__icon"
                style={{
                  backgroundImage: `url('${get(fiat, 'logoURI', '')}')`,
                }}
              />
              <div className="ExchangerSwap__select">
                {/*<span>{get(fiat, 'name', 'Unknown')}</span>*/}
                <div className="ExchangerSwap__currency">
                  <span>{get(fiat, 'symbol', 'Unknown')}</span>
                  <Icon icon={"chevron-down"} />
                </div>
              </div>
            </div>
            <div className="ExchangerSwap__fiat-amount">
              <span
                className="ExchangerSwap__link"
                onClick={() => handleFiatInput(fiatBalance)}
              >
                Balance:&nbsp;
                {getFinePrice(fiatBalance)} {fiatSymbol}
              </span>
              <DappInput
                placeholder="0.00"
                onChange={handleFiatInput}
                value={fiatValue}
                type="number"
                inputMode="decimal"
                onFocus={() => handleExchangeFocus('from')}
                textPosition="right"
              />
            </div>
          </div>
        </div>
        <div className="SwapForm__separator">
          <div
            className="ExchangerSwap__switchButton"
            onClick={() => {
              setFiat(coin);
              setCoin(fiat);
            }}
          >
            {isAdaptive ? (
              <Icon icon={"swap-vertical"} />
            ) : (
              <Icon icon={"swap-horizontal"} />
            )}
          </div>
        </div>
        <div className="SwapForm__form">
          <div className="SwapForm__form__control">
            <div className="ExchangerSwap__dropdown" onClick={coinSelector}>
              <div
                className="ExchangerSwap__icon"
                style={{
                  backgroundImage: `url('${get(coin, 'logoURI', '')}')`,
                }}
              />
              <div className="ExchangerSwap__select">
                <div className="ExchangerSwap__currency">
                  <span>{get(coin, 'symbol', 'Unknown')}</span>
                  <Icon icon={"chevron-down"} />
                </div>
              </div>
            </div>
            <div className="ExchangerSwap__fiat-amount">
              <DappInput
                placeholder="0.00"
                value={coinAmount}
                onChange={handleCoinInput}
                type="number"
                inputMode="decimal"
                onFocus={() => handleExchangeFocus('to')}
                textPosition="right"
                error={false}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="ExchangerSwap__rate">
        <span>
          Price
        </span>
        <span>
          1 {fiatSymbol} ≈ {getFinePrice(outputRate)} {coinSymbol}
        </span>
      </div>
      {context.isConnected ? (
        <div className="ExchangerSwap__actions-buy">
          {!IS_TELEGRAM && <Button
            large
            primary
            icon={isNoLiquidity
              ? "lab-test"
              : "swap-horizontal"}
            className=""
            disabled={!fiatAmount || !coinAmount}
            state={isProcessing ? 'loading' : ''}
            onClick={() =>
              exchangerModal({
                isExactOut,
                fiat,
                coin,
                fiatAmount,
                coinAmount,
              })
            }
          >
            {isNoLiquidity
              ? 'No liquidity found'
              : 'Swap'}
          </Button>}
        </div>
      ) : (
        <div className="ExchangerSwap__actions-buy">
          <Button
            large
            primary
            icon={"antenna"}
            className=""
            onClick={() => connectToWalletModal()}
          >
            Connect wallet
          </Button>
        </div>
      )}
      <Overlay portalClassName={"bp5-dark"}
               isOpen={isSelectFiat}
               onClose={() => setIsSelectFiat(false)}>
        <TokenSelect
          onChange={(value) => handleFiatChange(value)}
          onClose={() => setIsSelectFiat(false)}
          selected={fiat}
          commonBases={context.network.commonBases}
          isAdaptive={isAdaptive}
          {...context}
          //defaultList="fiats"
          tokens={[...coins]}
          fiats={fiats}
          loadAccountBalances={context.loadAccountBalances}
        />
      </Overlay>
      <Overlay portalClassName={"bp5-dark"}
               isOpen={isSelectCoin}
               onClose={() => setIsSelectCoin(false)}>
        <TokenSelect
          onChange={(value) => handleCoinChange(value)}
          onClose={() => setIsSelectCoin(false)}
          selected={coin}
          commonBases={context.network.commonBases}
          isAdaptive={isAdaptive}
          {...context}
          tokens={[...coins]}
          fiats={fiats}
          loadAccountBalances={context.loadAccountBalances}
        />
      </Overlay>
    </div>
  );
}

export default ExchangerSwap;
