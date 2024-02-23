import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import wei from 'utils/wei';
import getFinePrice from 'utils/getFinePrice';
import { ratesSelector, adaptiveSelector } from 'app/store/selectors';
import get from 'lodash/get';

// Components
import DexSwapInput from 'lib/Exchanger/components/DexSwapInput/DexSwapInput';
import {Icon} from '@blueprintjs/core';
import { Button } from 'ui';
import { Web3Context } from 'services/web3Provider';
import {ModalContext} from "services/ModalProvider";

// Styles
import './LiquidityAdd.scss';
import TokenSelect from 'lib/Exchanger/components/TokenSelect/TokenSelect';

let balanceInterval;
let token0;
let token1;
const TIMEOUT_BALANCE = 2000;

function LiquidityAdd({ onClose, type, addPool, currentPool, routerTokens }) {
  // Constants
  const {
    liquidityModal,
  } = React.useContext(ModalContext);
  const context = React.useContext(Web3Context);
  const {
    getPairAddress, getReserves, getTokenBalance, getTokenContract,
    network, tokens, customTokens, fiats, chainId, accountAddress,
    addCustomLP,
  } = context;
  const { routerAddress } = network.contractAddresses;
  const rates = useSelector(ratesSelector);
  
  const userId = `${chainId}${accountAddress}`;
  const chainFiats = get(fiats, 'known', []).filter(f => f.chainId === chainId);
  const defaultFiats = chainFiats.length ? chainFiats : [];
  const fiatTokens = get(fiats, userId, defaultFiats).map(token => {
    const price = get(rates, token.symbol.toLowerCase());

    if (price) {
      token.price = price;
    }

    return token;
  });

  const [isImport, setIsImport] = React.useState(type === 'import');

  // States
  // --Inputs
  const [values, setValues] = React.useState(['0', '0']);
  // --Tokens
  const [selectedTokens, setSelectedTokens] = React.useState([
    tokens.find(t => t.symbol === 'SGB'),
    tokens.find(t => t.symbol === 'exUSDT'),
  ]);
  const [selectToken, setSelectToken] = React.useState(0);
  const [reserves, setReserves] = React.useState([0,0]);
  const [balances, setBalances] = React.useState([0,0]);
  const [isToken, setIsToken] = React.useState(false);
  const [allowance, setAllowance] = React.useState([0, 0]);
  const [isApproving, setIsApproving] = React.useState(false);

  const amount0 = Number(values[0]) || 0;
  const amount1 = Number(values[1]) || 1;
  
  const [pairAddress, setPairAddress] = React.useState('');
  React.useEffect(() => {
    if (selectedTokens[0].symbol && selectedTokens[1].symbol) {
      getPairAddress(selectedTokens[0], selectedTokens[1]).then(setPairAddress)
    }
  }, [
    selectedTokens[0].symbol,
    selectedTokens[1].symbol,
  ]);

  const updateBalances = () => {
    if (!selectedTokens[0]
      || !selectedTokens[1]
      || selectedTokens[0].symbol === selectedTokens[1].symbol) {
      setBalances([0, 0]);
    }

    Promise.all([
      getTokenBalance(selectedTokens[0].address),
      getTokenBalance(selectedTokens[1].address),
    ]).then(data => {
      selectedTokens[0].balance = data[0];
      selectedTokens[1].balance = data[1];
      setBalances([
        wei.from(data[0], selectedTokens[0].decimals),
        wei.from(data[1], selectedTokens[1].decimals),
      ])
    })
  };

  const approve = async () => {
    setIsApproving(true);
    const token = !!allowance[0] ? token1 : token0;
    try {
      const amount = await token.approve(routerAddress, 5 * 10**9);
      if (!!allowance[0]) {
        setAllowance([allowance[0], amount]);
      } else {
        setAllowance([amount, allowance[1]]);
      }
    } catch (error) {
      console.error('[LiquidityAdd][approve]', token);
    }
    setIsApproving(false);
  };

  // On tokens changed
  React.useEffect(() => {
    setReserves([0,0]);
    setAllowance([0,0]);
    if (!selectedTokens[0]
      || !selectedTokens[1]
      || selectedTokens[0].symbol === selectedTokens[1].symbol) {
      return;
    }
    
    token0 = getTokenContract(selectedTokens[0]);
    token1 = getTokenContract(selectedTokens[1]);

    Promise.allSettled([
      getReserves(selectedTokens[0], selectedTokens[1]),
      token0.getAllowance(routerAddress),
      token1.getAllowance(routerAddress),
    ]).then(data => {
      if (!!data[0].value) {
        setReserves([
          wei.from(data[0].value[0], selectedTokens[0].decimals),
          wei.from(data[0].value[1], selectedTokens[1].decimals),
        ]);
      }
      setAllowance([
        data[1].value,
        data[2].value,
      ])
    }).catch(error => {
      console.error('[LiquidityAdd]', error);
    });

    updateBalances();
    // clearInterval(balanceInterval);
    // balanceInterval = setInterval(updateBalances, TIMEOUT_BALANCE);
  }, [selectedTokens]);

  // Set default selected tokens
  React.useEffect(() => {
    const { tokens } = context;
    if (currentPool) {
      getReserves(currentPool).then(reserve => {
        setSelectedTokens([reserve[2].token0, reserve[2].token1]);
        // clearInterval(balanceInterval);
        // balanceInterval = setInterval(updateBalances, TIMEOUT_BALANCE);
      }).catch(error => {
        console.error("[LiquidityAdd] Can't set the current pool", currentPool, error);
      });
    } else {
      const firstToken = tokens.find(t => t.symbol === 'SGB');
      const secondToken = tokens.find(t => t.symbol === 'exUSDT');

      setSelectedTokens([firstToken, secondToken]);
      // clearInterval(balanceInterval);
      // balanceInterval = setInterval(updateBalances, TIMEOUT_BALANCE);
    }

    // return () => {
    //   clearInterval(balanceInterval);
    // }
  }, []);

  React.useEffect(() => {
    if(routerTokens.isExists) {
      const tokensPair = [
        tokens.find(t => t.symbol === routerTokens.token0),
        tokens.find(t => t.symbol === routerTokens.token1),
      ];

      if (!tokensPair[0] || !tokensPair[1]) return;
      if(tokensPair[0] === tokensPair[1]) return;

      setSelectedTokens(tokensPair);
    }
  }, []);

  const rate0 = !!reserves[1]
    ? reserves[0] / reserves[1]
    : !!amount1
      ? amount0 / amount1
      : 0;
  const rate1 = !!reserves[0]
    ? reserves[1] / reserves[0]
    : !!amount0
      ? amount1 / amount0
      : 0;
  const share = !!reserves[0]
    ? amount0 / (amount0 + reserves[0]) * 100
    : 100;
  const isAvailable = !!allowance[0]
    && !!allowance[1]
    && amount0 <= balances[0]
    && amount1 <= balances[1]
    && amount0 > 0
    && amount1 > 0;
  
  const perLang = 'per';
  const enableLang = "Enable";
  
  const onAddPair = async () => {
    try {
      const pairAddress = await getPairAddress(selectedTokens[0], selectedTokens[1]);
      await addCustomLP(pairAddress);
      onClose();
    } catch (error) {
      console.error('[onAddPair]', error);
    }
  };

  return (
    <>
      <div className="Liquidity__header LiquidityAdd">
        <div className="Liquidity__title">
          {isImport
            ? "Import Liquidity"
            : "Add Liquidity"}
        </div>
        <div className="close" onClick={onClose}>
          <Icon icon={"cross"} />
        </div>
      </div>
      <div className="Liquidity__body LiquidityAdd">
        <DexSwapInput
          onChange={(value) => {
            const secondValue = !!reserves[0]
              ? reserves[1] / reserves[0] * (Number(value) || 0)
              : values[1];
            setValues((state) => [value, secondValue]);
          }}
          onSelectToken={() => {
            setSelectToken(0);
            setIsToken(true);
          }}
          value={values[0]}
          token={selectedTokens[0]}
          showBalance
          label
        />
        <div className="LiquidityAdd__icon">
          <span>+</span>
        </div>
        <DexSwapInput
          onChange={(value) => {
            const secondValue = !!reserves[1]
              ? reserves[0] / reserves[1] * (Number(value) || 0)
              : values[0];
            setValues((state) => [secondValue, value]);
          }}
          onSelectToken={() => {
            setSelectToken(1);
            setIsToken(true);
          }}
          value={values[1]}
          token={selectedTokens[1]}
          showBalance
          label
        />
        {!isImport && (
          <>
            <span className="default-text-light">
              Pool rates
            </span>
            <div className="LiquidityAdd__result">
              <div className="LiquidityAdd__item">
                <span>{getFinePrice(rate0)}</span>
                <span>
                  {selectedTokens[0].symbol}&nbsp;
                  {perLang}&nbsp;
                  {selectedTokens[1].symbol}
                </span>
              </div>
              <div className="LiquidityAdd__item">
                <span>{getFinePrice(rate1)}</span>
                <span>
                  {selectedTokens[1].symbol}&nbsp;
                  {perLang}&nbsp;
                  {selectedTokens[0].symbol}
                </span>
              </div>
              <div className="LiquidityAdd__item">
                <span>{getFinePrice(share)} %</span>
                <span>
                  Your share in the pool
                </span>
              </div>
            </div>
            {!allowance[0] && <Button
              loading={isApproving}
              primary
              large
              onClick={approve}
            >
              {enableLang} {selectedTokens[0].symbol}
            </Button>}
            {(!!allowance[0] && !allowance[1]) && <Button
              loading={isApproving}
              primary
              large
              onClick={approve}
            >
              {enableLang} {selectedTokens[1].symbol}
            </Button>}
            <Button
              primary={isAvailable}
              disabled={!isAvailable}
              large
              onClick={() => liquidityModal({
                selectedTokens,
                reserves,
                rate0,
                rate1,
                share,
                amount0,
                amount1,
                pairAddress,
              })}
            >
              Supply
            </Button>
          </>
        )}
        {isImport && (
          <div className="LiquidityAdd__import__footer">
            <Button primary large onClick={onAddPair}>
              Import Liquidity Pair
            </Button>
          </div>
        )}
      </div>
      {isToken && (
        <TokenSelect
          selected={selectToken === 0 ? selectedTokens[0] : selectedTokens[1]}
          onClose={() => setIsToken(false)}
          onChange={(token) => {
            if (selectToken === 0) {
              setSelectedTokens((state) => {
                if(token.symbol === state[1].symbol) {
                  return [token, state[0]];
                }

                return [token, state[1]];
              });
            } else {
              setSelectedTokens((state) => {
                if(state[0].symbol === token.symbol) {
                  return [state[1], token];
                }

                return [state[0], token];
              });
            }

            setIsToken(false);
          }}
          commonBases={network.commonBases}
          {...context}
          tokens={[...customTokens, ...tokens]}
          fiats={fiatTokens}
        />
      )}
    </>
  );
}

LiquidityAdd.propTypes = {
  onClose: PropTypes.func,
  type: PropTypes.string,
  routerTokens: PropTypes.object,
};

LiquidityAdd.defaultProps = {
  onClose: () => {},
  type: 'add',
  routerTokens: { isExists: false },
};

export default LiquidityAdd;
