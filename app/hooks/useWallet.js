import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {Web3Context} from "services/web3Provider";
import {TelegramContext} from "services/telegramProvider";
import toaster from "services/toaster";
import {appSetGasless} from "slices/App";
import PXLsABI from "const/ABI/PXLs";
import {wei} from "utils";
import {gaslessSelector} from "app/store/selectors";

function useWallet(place) {
  
  const dispatch = useDispatch();
  const {
    isConnected,
    loadAccountBalances,
    accountAddress,
    apiGetTelegramUser,
    setSettingsButton,
    getContract,
    network,
  } = React.useContext(Web3Context);
  const {
    privateKey,
    setPrivateKey,
    telegramId,
    telegramUserName,
    telegramFirstName,
    telegramLastName,
    clearBackActions,
    hideMainButton,
    haptic,
    getPrivateKey,
  } = React.useContext(TelegramContext);
  
  const [isKeyLoading, setKeyIsLoading] = React.useState(true);
  const [isUserGranted, setIsUserGranted] = React.useState(false);
  
  React.useEffect(() => {
    getPrivateKey().then(privateKey => {
      if (isConnected && privateKey) {
        clearBackActions();
        hideMainButton();
        haptic.soft();
      }
      if (!privateKey) {
        setKeyIsLoading(false);
      }
    }).catch(error => {
      setKeyIsLoading(false);
      console.log('[useWallet]', error);
    })
    if (isConnected) {
      setKeyIsLoading(false);
      loadAccountBalances();
    }
  }, [isConnected]);
  
  React.useEffect(() => {
    if (!isConnected) {
      return;
    }
    apiGetTelegramUser().then(result => {
      if (result.status === 'created' || result.status === true) {
        toaster.success('Mining access granted');
      } else {
        console.log('Mining in progress', result);
      }
      dispatch(appSetGasless(result.gasless));
      setIsUserGranted(true);
      haptic.tiny();
    }).catch(error => {
      console.error('Grant Access Error', error);
      toaster.error(error.message);
      haptic.error();
    })
  }, [isConnected]);
  
  
  
  return {
    isKeyLoading,
    isUserGranted,
  };
}

export default useWallet;
