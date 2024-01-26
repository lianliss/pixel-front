import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import wei from 'utils/wei';
import getFinePrice from 'utils/getFinePrice';

// Components
import { Button, BottomSheetModal, WalletIcon } from 'ui';
import {Icon, Spinner} from '@blueprintjs/core';
import { Web3Context } from 'services/web3Provider';

// Utils
import toaster from "services/toaster";

// Styles
import './LiquidityConfirmModal.scss';

const processError = error => {
  const {message} = error;
  try {
    if (message.indexOf('Internal JSON-RPC error.') >= 0) {
      const internal = JSON.parse(message.split('Internal JSON-RPC error.')[1]);
      return internal.message;
    } else {
      return message;
    }
  } catch (err) {
    console.log('ERRR', err);
    return message;
  }
};

function LiquidityConfirmModal(props) {
  const {
    selectedTokens,
    reserves,
    rate0,
    rate1,
    share,
    amount0,
    amount1,
    pairAddress,
    transactionSubmitted,
  } = props;
  const context = React.useContext(Web3Context);
  const {
    getReserves,
    transaction, getTransactionReceipt,
    network, web3,
    accountAddress,
    getBSCScanLink,
    addTokenToWallet,
  } = context;
  const { wrapToken, defaultSymbol } = network;
  const { routerAddress } = network.contractAddresses;
  const dispatch = useDispatch();
  const [pair, setPair] = React.useState(null);
  const adaptive = useSelector((store) => store.default.adaptive);
  const Component = BottomSheetModal;
  const [slippageTolerance, setSlippageTolerance] = React.useState(0.9);
  const [isTransaction, setIsTransaction] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');

  React.useEffect(() => {
    getReserves(pairAddress).then(data => {
      setPair(data[2]);
    });
  }, [pairAddress]);

  if (!pair) return (<Component
    className="LiquidityConfirmModal"
    prefix="LiquidityConfirmModal"
    skipClose
    {...props}
  >
    <Spinner />
  </Component>);

  const totalSupply = wei.from(pair.totalSupply);
  const reserve0 = wei.from(pair[
    selectedTokens[0].symbol === defaultSymbol ? defaultSymbol : selectedTokens[0].symbol
    ]);
  const reserve1 = wei.from(pair[
    selectedTokens[1].symbol === defaultSymbol ? defaultSymbol : selectedTokens[1].symbol
    ]);
  const lpTokens = Math.min(amount0 * totalSupply / reserve0, amount1 * totalSupply / reserve1);
  const isBNB = !selectedTokens[0].address || !selectedTokens[1].address;

  const addToken = () => {
    addTokenToWallet({
      address: pairAddress,
      symbol: `${selectedTokens[0].symbol}-${selectedTokens[1].symbol}`,
      decimals: 18,
    })
  };

  const supply = async () => {
    setIsTransaction(true);
    setErrorText('');
    try {
      const routerContract = new (web3.eth.Contract)(
        require('const/ABI/PancakeRouter'),
        routerAddress,
      );
      let minA = amount0 - amount0 * slippageTolerance;
      let minB = amount1 - amount0 * slippageTolerance;
      if (minA < 0) minA = 0;
      if (minB < 0) minB = 0;
      let method = 'addLiquidity';
      const params = [
        selectedTokens[0].address,
        selectedTokens[1].address,
        wei.to(amount0, selectedTokens[0].decimals || 18),
        wei.to(amount1, selectedTokens[1].decimals || 18),
        wei.to(minA, selectedTokens[0].decimals || 18),
        wei.to(minB, selectedTokens[1].decimals || 18),
        accountAddress,
        Number(Date.now() / 1000 + 60 * 15).toFixed(0),
      ];
      console.log('[supply]', method, params, selectedTokens);
      const txHash = await transaction(routerContract, method, params);
      const receipt = await getTransactionReceipt(txHash);
      console.log('[supply] Success', txHash, receipt);
      transactionSubmitted({
        txLink: getBSCScanLink(txHash),
        symbol: `${selectedTokens[0].symbol}-${selectedTokens[1].symbol}`,
        addToken,
        onClose: props.onClose,
      });
    } catch (error) {
      console.error('[LiquidityConfirmModal][supply]', error);
      setErrorText(processError(error));
      toaster.error('Transaction declined');
    }
    setIsTransaction(false);
  };

  const supplyBNB = async () => {
    setIsTransaction(true);
    setErrorText('');
    try {
      const routerContract = new (web3.eth.Contract)(
        require('const/ABI/PancakeRouter'),
        routerAddress,
      );
      let method = 'addLiquidityETH';
      const tokenIndex = Number(!selectedTokens[0].address);
      const token = selectedTokens[tokenIndex];
      const amount = tokenIndex ? amount1 : amount0;
      const bnbAmount = !tokenIndex ? amount1 : amount0;
      const params = [
        token.address,
        wei.to(amount, token.decimals || 18),
        wei.to(amount - amount * slippageTolerance, token.decimals || 18),
        wei.to(bnbAmount - bnbAmount * slippageTolerance, wrapToken.decimals || 18),
        accountAddress,
        Number(Date.now() / 1000 + 60 * 15).toFixed(0),
      ];
      console.log('[supplyBNB]', method, params, wei.to(bnbAmount, wrapToken.decimals || 18));
      const txHash = await transaction(
        routerContract, method, params, wei.to(bnbAmount, wrapToken.decimals || 18)
      );
      const receipt = await getTransactionReceipt(txHash);
      console.log('[supplyBNB] Success', txHash, receipt);
      transactionSubmitted({
        txLink: getBSCScanLink(txHash),
        symbol: `${selectedTokens[0].symbol}-${selectedTokens[1].symbol}`,
        addToken,
        onClose: props.onClose,
      });
    } catch (error) {
      console.error('[LiquidityConfirmModal][supplyBNB]', error);
      setErrorText(processError(error));
      toaster.error('Transaction declined');
    }
    setIsTransaction(false);
  };

  return (
    <Component
      className="LiquidityConfirmModal"
      prefix="LiquidityConfirmModal"
      skipClose
      {...props}
    >
      <div className="LiquidityConfirmModal__row">
        <h2>You will receive</h2>
        <div className="close" onClick={props.onClose}>
          {<Icon icon={"cross"}/>}
        </div>
      </div>
      <div className="LiquidityConfirmModal__row">
        <span className="large-text">
          {getFinePrice(lpTokens)}
        </span>
        <WalletIcon currency={selectedTokens[0].symbol} size={41} />
        <WalletIcon currency={selectedTokens[1].symbol} size={41} />
      </div>
      <div className="LiquidityConfirmModal__row">
        <p className="medium-text">{selectedTokens[0].symbol}/{selectedTokens[1].symbol} Pool Tokens</p>
      </div>
      <div className="LiquidityConfirmModal__row">
        <p className="small-text">
          Output is estimated. If the price changes by more than 0.8% your
          transaction will revert.
        </p>
      </div>
      <div className="LiquidityConfirmModal__row">
        <div className="LiquidityConfirmModal__result">
          <div className="LiquidityConfirmModal__item">
            <span className="default-text-dark">{selectedTokens[0].symbol} Deposited</span>
            <span className="default-text-dark">
              <WalletIcon currency={selectedTokens[0].symbol} size={24} marginRight={10} />
              {getFinePrice(amount0)}
            </span>
          </div>
          <div className="LiquidityConfirmModal__item">
            <span className="default-text-dark">{selectedTokens[1].symbol} Deposited</span>
            <span className="default-text-dark">
              <WalletIcon currency={selectedTokens[1].symbol} size={24} marginRight={10} />
              {getFinePrice(amount1)}
            </span>
          </div>
          <div className="LiquidityConfirmModal__item">
            <span className="default-text-dark">Rates</span>
            <span className="default-text-dark">
              1
              {selectedTokens[0].symbol}
              &nbsp;=&nbsp;
              {getFinePrice(rate1)}
              {selectedTokens[1].symbol}
            </span>
          </div>
          <div className="LiquidityConfirmModal__item">
            <span className="default-text-dark"></span>
            <span className="default-text-dark">
              1 {selectedTokens[1].symbol}
              &nbsp;=&nbsp;
              {getFinePrice(rate0)}
              {selectedTokens[0].symbol}
            </span>
          </div>
          <div className="LiquidityConfirmModal__item">
            <span className="default-text-dark">Share of Pool:</span>
            <span className="default-text-dark">
              {getFinePrice(share)} %
            </span>
          </div>
        </div>
      </div>
      <div className="LiquidityConfirmModal__row">
        <Button
          size="extra_large"
          type="lightBlue"
          disabled={isTransaction}
          state={isTransaction ? 'loading' : ''}
          onClick={() => {
            if (isBNB) {
              supplyBNB();
            } else {
              supply();
            }
            //openStateModal('transaction_waiting');
          }}
        >
          Confirm Supply
        </Button>
      </div>
      {/* {!!errorText.length && <div className="FarmingPopup__error">{errorText}</div>} */}
    </Component>
  );
}

export default LiquidityConfirmModal;
