import React from 'react';
import { useSelector } from 'react-redux';
import { Web3Context } from 'services/web3Provider';
import {
  useNavigate,
  useMatch,
} from 'react-router-dom';
import routes from 'const/routes';
import { ratesSelector, adaptiveSelector } from 'app/store/selectors';
import ExchangerStorage from 'services/ExchangerStorage';
import { FiatToken } from 'services/Token';

const UPDATE_DELAY = 5000;
let fiatsUpdateTimeout;
let updateTokenBalanceTimeout;
// Let's predefine functions so that timeouts take their actual versions
let fiatsUpdate;

const useExchanger = () => {
  const isAdaptive = useSelector(adaptiveSelector);
  const initialCurrencySymbol = 'WSGB'; //route.params.currency;
  const rates = useSelector(ratesSelector);
  const context = React.useContext(Web3Context);
  const navigate = useNavigate();
  const routePath = routes.exchangeCurrency.path;
  const match = useMatch(routePath);

  const {
    fiats,
    chainId,
    accountAddress,
    updateFiats,
    isConnected,
    tokens,
    cmcTokens,
    getTokens,
    fiatsLoaded,
    tokensLoaded,
    getTokenBalance,
    updateTokenBalance: updateTokenBalanceContext,
  } = context;

  const [fiatSelected, setFiatSelected] = React.useState(null);
  const [coinSelected, setCoinSelected] = React.useState(null);
  const [initTokensMounted, setInitTokensMounted] = React.useState(false);
  const fiatSymbol = _.get(fiatSelected, 'symbol');
  const coinSymbol = _.get(coinSelected, 'symbol');

  const userId = `${chainId}${accountAddress}`;
  const fiatTokens = _.get(fiats, userId, []).map((token) => {
    const price = _.get(rates, token.symbol.toLowerCase());

    if (price) {
      token.price = price;
    }

    return token;
  });
  // Get raw coins list
  const coins = _.uniqBy(tokens, 'address');

  // Filters for select the fiat.
  const params = _.get(match, 'params', {});
  const paramsFrom = params.from !== 'undefined' ? params.from : null;
  const paramsTo = params.to !== 'undefined' ? params.to : null;
  const allCoins = [...fiatTokens, ...coins];
  
  const isParamsFiat = (t) => t.symbol === paramsFrom;
  const isParamsCoin = (t) => t.symbol === paramsTo;
  const isSelectedFiat = (t) => t.symbol === fiatSymbol;
  const isSelectedCoin = (t) => t.symbol === coinSymbol;

  const getParamsFiat = () =>
    allCoins.find((t) => isParamsFiat(t));
  const getParamsCoin = () =>
    allCoins.find((t) => isParamsCoin(t));

  // Exchanger storage.
  const exchangerStorage = new ExchangerStorage();
  const initialFiat = _.get(exchangerStorage.storage, 'fiat');
  const initialCoin = _.get(exchangerStorage.storage, 'coin');

  // Get token by storage.
  const getInitialFiat = () => allCoins.find((t) => t.symbol === initialFiat) || allCoins[1];
  const getInitialCoin = () => allCoins.find((t) => t.symbol === initialCoin) || allCoins[0];

  const swapSelected = () => {
    if (coinSelected) {
      setFiatSelected(coinSelected);
    } else {
      setFiatSelected(
        allCoins.find((t) => t.symbol !== fiatSelected?.symbol)
      );
    }

    if (fiatSelected) {
      setCoinSelected(fiatSelected);
    } else {
      setCoinSelected(
        allCoins.find((t) => t.symbol !== coinSelected?.symbol)
      );
    }
    
    navigate(routePath
      .replace(':from', paramsTo)
      .replace(':to', paramsFrom),
      {replace: true});
  };

  /**
   * Update "fiatSelected" — fiat token state.
   * Sets router param
   * @param currencyObject {object} - fiat token
   */
  const setFiat = (currencyObject) => {
    //console.log('setFiat', currencyObject, coinSymbol);
    if (!currencyObject) return;
    if (currencyObject.symbol === coinSymbol && !!coinSelected) {
      return swapSelected();
    }
    setFiatSelected(currencyObject);
    if (coinSymbol || paramsTo) {
      navigate(routePath
          .replace(':from', currencyObject.symbol)
          .replace(':to', coinSymbol || paramsTo),
        {replace: true});
    }
  };

  /**
   * Update "fiatSelected" — coin token state.
   * Sets router param
   * @param currencyObject {object} - coin token
   */
  const setCoin = (currencyObject) => {
    //console.log('setCoin', currencyObject, fiatSymbol);
    if (!currencyObject) return;
    if (currencyObject.symbol === fiatSymbol && !!fiatSelected) {
      return swapSelected();
    }
    setCoinSelected(currencyObject);
    
    if (fiatSymbol || paramsFrom) {
      navigate(routePath
          .replace(':from', fiatSymbol || paramsFrom)
          .replace(':to', currencyObject.symbol),
        {replace: true});
    }
  };

  /**
   * Update the fiats tokens list and their balances.
   * Sets the default fiat
   */
  fiatsUpdate = async () => {
    try {
      await updateFiats().then((fiats) => {
        const currencySymbol = _.get(match, 'params.from');
        const userIdFiats = _.get(fiats, userId, []);
        if (!fiatSelected) {
          const initialCurrency =
            userIdFiats.find((fiat) => fiat.symbol === currencySymbol) ||
            userIdFiats[0];

          if (initialCurrency) {
            setFiat(initialCurrency);
          }
        } else {
          const updatedFiat = userIdFiats.find(
            (c) => currencySymbol === c.symbol
          );
          if (updatedFiat) {
            setFiat(updatedFiat);
          }
        }
      });
    } catch (error) {
      console.error('[fiatsUpdate]', error);
    }

    fiatsUpdateTimeout = setTimeout(() => fiatsUpdate(), UPDATE_DELAY);
  };

  const updateTokenBalance = async () => {
    try {
      if (!isConnected) return;
      if (_.get(fiatSelected, 'isFiat', false)) return;

      // Get the currency coin to update it.
      // The using fiatSelected here is unwanted solution.
      const currencySymbol = paramsTo;
      const currency = coins.find((t) => t.symbol === currencySymbol);
      if (!currency) return;

      // Fetch the token balance.
      const balance = await getTokenBalance(currency.address, true);

      // While the balance is loading currency can be changed.
      // const match = useMatch(routePath);
      // const symbolAfterLoading = _.get(match, 'params.to');
      // if (currencySymbol !== symbolAfterLoading) return;

      // Set the token balance to context.
      // And set the new fiatSelected with the current balance.
      updateTokenBalanceContext(currency.address, balance);
      setFiatSelected({ ...currency, balance });
    } catch (error) {
      console.error('[updateTokenBalance]', error);
    }

    // Update the balance with UPDATE_DELAY.
    updateTokenBalanceTimeout = setTimeout(
      () => updateTokenBalance(),
      UPDATE_DELAY
    );
  };

  React.useEffect(() => {
    if (!cmcTokens) {
      getTokens();
    }
  }, []);

  React.useEffect(() => {
    //fiatsUpdate();
    return () => {
      clearTimeout(fiatsUpdateTimeout);
    };
  }, [accountAddress, chainId, isConnected]);

  // Set initial coin
  React.useEffect(() => {
    const coin = getParamsCoin() || getInitialCoin();

    setCoin(coin);
  }, [chainId]);

  // Set initial fiat
  React.useEffect(() => {
    const fiat = getParamsFiat() || getInitialFiat();
    setFiat(fiat);
  }, [fiatsLoaded, chainId]);

  React.useEffect(() => {
    updateTokenBalance();

    return () => {
      clearTimeout(updateTokenBalanceTimeout);
    };
  }, [fiatSymbol, chainId, isConnected]);

  React.useEffect(() => {
    const isSymbols = fiatSymbol && coinSymbol;
    const coinsIsLoaded = fiatsLoaded && tokensLoaded;

    if (isConnected && isSymbols && coinsIsLoaded) {
      exchangerStorage.set({
        fiat: fiatSymbol,
        coin: coinSymbol,
      });
    }

    // if (fiatSymbol === coinSymbol) {
    //   setFiat(getParamsFiat());
    // }
  }, [fiatSymbol, coinSymbol]);

  // React.useEffect(() => {
  //   if (initTokensMounted) return;
  //   if (!isConnected || !fiatsLoaded || !tokensLoaded) return;
  //
  //   const coin = getInitialCoin() || getParamsCoin();
  //   const fiat = getInitialFiat() || getParamsFiat();
  //
  //   setCoin(coin);
  //   setFiat(fiat);
  //
  //   setInitTokensMounted(true);
  // }, [isConnected, fiatsLoaded, tokensLoaded]);

  return {
    fiatTokens,
    coins,
    fiatSelected,
    coinSelected,
    setFiat,
    setCoin,
    isAdaptive,
    fiatsLoaded,
  };
};

export default useExchanger;
