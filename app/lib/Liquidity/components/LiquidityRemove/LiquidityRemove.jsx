import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import wei from 'utils/wei';
import getFinePrice from 'utils/getFinePrice';
import toaster from "services/toaster";

// Components
import { Button, WalletIcon, DoubleWallets } from 'ui';
import LiquidityRange from '../LiquidityRange/LiquidityRange';
import { Web3Context } from 'services/web3Provider';
import {ModalContext} from "services/ModalProvider";

// Styles
import './LiquidityRemove.scss';
import {Icon, Spinner} from "@blueprintjs/core";

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

function LiquidityRemove({ onClose, currentPool }) {
  const dispatch = useDispatch();
  const context = React.useContext(Web3Context);
  const {transactionSubmitted} = React.useContext(ModalContext);
  const {
    getReserves,
    transaction, getTransactionReceipt,
    getTokenContract, chainId,
    network, web3,
    accountAddress, bnb,
    getBSCScanLink,
    addTokenToWallet,
    approve,
  } = context;
  const { wrapToken, defaultSymbol } = network;
  const { routerAddress } = network.contractAddresses;
  const [balance, setBalance] = React.useState(0);
  const [allowance, setAllowance] = React.useState(0);
  const [pair, setPair] = React.useState(null);
  const [isApproving, setIsApproving] = React.useState(false);
  const [isTransaction, setIsTransaction] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');
  const [multiplier, setMultiplier] = React.useState(0.75);
  const [slippageTolerance, setSlippageTolerance] = React.useState(0.08);

  const tokenContract = getTokenContract({
    address: currentPool,
    decimals: 18,
  });

  React.useEffect(() => {
    Promise.all([
      getReserves(currentPool),
      tokenContract.getBalance(),
      tokenContract.getAllowance(routerAddress, accountAddress, 5 * 10**9),
    ]).then(data => {
      setPair(data[0][2]);
      setBalance(data[1]);
      setAllowance(data[2]);
    });
  }, [currentPool]);

  if (!pair) return (<>
    <Spinner />
  </>);

  const symbol0 = _.get(pair, 'token0.symbol', '');
  const symbol1 = _.get(pair, 'token1.symbol', '');
  const decimals0 = _.get(pair, 'token0.decimals', 18);
  const decimals1 = _.get(pair, 'token1.decimals', 18);
  const reserve0 = wei.from(pair[symbol0] || '0', decimals0);
  const reserve1 = wei.from(pair[symbol1] || '0', decimals1);
  const totalSupply = wei.from(_.get(pair, 'totalSupply', '0'));
  const share = totalSupply ? balance / totalSupply : 0;
  const userAmount0 = reserve0 * share;
  const userAmount1 = reserve1 * share;

  const onApprove = async () => {
    setIsApproving(true);
    try {
      const amount = await tokenContract.approve(routerAddress, 5 * 10**9);
      setAllowance(tokenContract.allowance);
    } catch (error) {
      console.error('[LiquidityRemove][approve]', error);
    }
    setIsApproving(false);
  };

  const isApproved = allowance >= balance;
  const isToken0Wrap = pair.token0.address === wrapToken.address || !pair.token0.address;
  const isToken1Wrap = pair.token1.address === wrapToken.address || !pair.token1.address;
  const isBNB = isToken0Wrap || isToken1Wrap;

  const onRemove = async () => {
    setIsTransaction(true);
    toaster.warning('Transaction waiting');
    // openStateModal('transaction_waiting', {
    //   onClose: onClose,
    //   token0: {
    //     symbol: symbol0,
    //     number: userAmount0 * multiplier,
    //   },
    //   token1: {
    //     symbol: symbol1,
    //     number: userAmount1 * multiplier,
    //   }
    // });
    
    const token = isToken0Wrap ? pair.token1 : pair.token0;
    const tokenAmount = isToken0Wrap ? userAmount1 : userAmount0;
    const bnbAmount = isToken0Wrap ? userAmount0 : userAmount1;
    const deadline = Number(Date.now() / 1000 + 60 * 15).toFixed(0);
    const routerContract = new (web3.eth.Contract)(
      require('const/ABI/PancakeRouter'),
      routerAddress,
    );
    try {
      let method;
      let params;
      if (isBNB) {
        method = 'removeLiquidityETH';
        params = [
          token.address,
          wei.to(balance * multiplier),
          wei.to(
            (tokenAmount * multiplier - tokenAmount * multiplier * slippageTolerance),
            token.decimals || 18),
          wei.to(
            (bnbAmount * multiplier - bnbAmount * multiplier * slippageTolerance),
            bnb.decimals || 18),
          accountAddress,
          deadline,
        ];
      } else {
        method = 'removeLiquidity';
        params = [
          pair.token0.address,
          pair.token1.address,
          wei.to(balance * multiplier),
          wei.to(
            (tokenAmount * multiplier - tokenAmount * multiplier * slippageTolerance),
            token.decimals || 18),
          wei.to(
            (bnbAmount * multiplier - bnbAmount * multiplier * slippageTolerance),
            bnb.decimals || 18),
          accountAddress,
          deadline,
        ]
      }
      let txHash;
      try {
        txHash = await transaction(routerContract, method, params);
      } catch (error) {
        console.error('[LiquidityRemove][onRemove]', method, params, error);
        if (isBNB) {
          method = 'removeLiquidityETHSupportingFeeOnTransferTokens';
          txHash = await transaction(routerContract, method, params);
        }
      }
      const receipt = await getTransactionReceipt(txHash);
      console.log('[onRemove] Success', txHash, receipt);

      if(txHash) {
        transactionSubmitted({
          txLink: getBSCScanLink(txHash),
          onClose: onClose,
        });
      } else {
        toaster.error('Transaction declined');
      }

      onClose()
    } catch (error) {
      console.error('[LiquidityRemove][onRemove]', error);
      setErrorText(processError(error));
    }
    setIsTransaction(false);
  };

  return (
    <>
      <div className="Liquidity__header LiquidityRemove">
        <div className="Liquidity__title">Remove Liquidity</div>
        <div className="close" onClick={onClose}>
          <Icon icon={"cross"} />
        </div>
      </div>
      <div className="Liquidity__body LiquidityRemove">
        <LiquidityRange onChange={setMultiplier} defaultValue={0.75} />
        <div className="icon__wrap">
          <Icon icon={"double-chevron-right"} />
        </div>
        <div className="LiquidityRemove__result">
          <div className="LiquidityRemove__item">
            <span className="default-text-dark">
              {getFinePrice(userAmount0 * multiplier)}
            </span>
            <span className="default-text-dark">
              <WalletIcon currency={pair.token0} size={24} marginRight={8} />
              {symbol0}
            </span>
          </div>
          <div className="LiquidityRemove__item">
            <span className="default-text-dark">
              {getFinePrice(userAmount1 * multiplier)}
            </span>
            <span className="default-text-dark">
              <WalletIcon currency={pair.token1} size={24} marginRight={8} />
              {symbol1}
            </span>
          </div>
        </div>
        <div className="LiquidityRemove__prices">
          <div className="LiquidityRemove__item">
            <span className="default-text-dark">Price:</span>
            <span className="default-text-dark">
              1 {symbol0}
              &nbsp;=&nbsp;
              {getFinePrice(reserve1 / reserve0)} {symbol1}
            </span>
          </div>
          <div className="LiquidityRemove__item">
            <span className="default-text-dark"></span>
            <span className="default-text-dark">
              1 {symbol1}
              &nbsp;=&nbsp;
              {getFinePrice(reserve0 / reserve1)} {symbol0}
            </span>
          </div>
        </div>
        {!isApproved && <Button type="lightBlue"
                state={isApproving ? 'loading' : ''}
                size="extra_large" onClick={onApprove}>
          Enable
        </Button>}
        <Button type={isApproved ? 'lightBlue' : 'secondary'}
                disabled={!isApproved || isTransaction}
                state={isTransaction ? 'loading' : ''}
                size="extra_large" onClick={onRemove}>
          Remove
        </Button>
        {!!errorText.length && <div className="FarmingPopup__error">{errorText}</div>}
        <div className="LiquidityRemove__result">
          <div className="LiquidityRemove__item">
            <span className="default-text-dark">
              <DoubleWallets
                pair={pair}
                size={24}
                separator="/"
                className="default-text-dark"
              />
            </span>
            <span className="default-text-dark">
              {getFinePrice(balance)}
            </span>
          </div>
          <div className="LiquidityRemove__item">
            <span className="default-text-dark">{symbol0}:</span>
            <span className="default-text-dark">
              {getFinePrice(userAmount0)}
            </span>
          </div>
          <div className="LiquidityRemove__item">
            <span className="default-text-dark">{symbol1}:</span>
            <span className="default-text-dark">
              {getFinePrice(userAmount1)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

LiquidityRemove.propTypes = {
  onClose: PropTypes.func,
};

LiquidityRemove.defaultProps = {
  onClose: () => {},
};

export default LiquidityRemove;
