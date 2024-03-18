import React from 'react';
import styles from './Wallet.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import LoadModule, {Loading} from  'utils/async/load-module';
import {Web3Context} from "services/web3Provider";
import {useNavigate} from 'react-router-dom';
import routes from 'const/routes';
import {TelegramContext} from "services/telegramProvider";
import CopyAddress from "lib/Wallet/components/CopyAddress/CopyAddress";
import WalletBlock from "lib/Wallet/components/WalletBlock/WalletBlock";
import Balance from "lib/Wallet/components/Balance/Balance";
import Icons from "lib/Wallet/components/Icons/Icons";
import Portfolio from "lib/Wallet/components/Portfolio/Portfolio";
import Tokens from "lib/Wallet/components/Tokens/Tokens";
import {loadAccountBalances} from "services/web3Provider/methods";
import miningApi from "utils/async/api/mining";
import toaster from "services/toaster";
import {appSetGasless} from "slices/App";

function Wallet() {
  console.log('WALLET');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    isConnected,
    tokens,
    loadAccountBalances,
    accountAddress,
    apiGetTelegramUser,
  } = React.useContext(Web3Context);
  const telegram = React.useContext(TelegramContext);
  const {
    privateKey,
    setPrivateKey,
    telegramId,
    telegramUserName,
    telegramFirstName,
    telegramLastName,
  } = telegram;
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMiningChecked, setIsMiningChecked] = React.useState(false);
  
  React.useEffect(() => {
    telegram.getPrivateKey().then(privateKey => {
      if (isConnected && privateKey) {
        telegram.clearBackActions();
        telegram.hideMainButton();
        telegram.haptic.soft();
      }
      if (!privateKey) {
        setIsLoading(false);
      }
    }).catch(error => {
      setIsLoading(false);
      console.log('[Wallet]', error);
    })
    if (isConnected) {
      setIsLoading(false);
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
        console.log('Mining access granted', result);
      } else {
        console.log('Mining in progress', result);
      }
      dispatch(appSetGasless(result.gasless));
      setIsMiningChecked(true);
      telegram.haptic.tiny();
    }).catch(error => {
      console.log('Grant Access Error', error);
      telegram.haptic.error();
    })
  }, [isConnected]);
  
  if (isLoading) {
    return <div className={styles.wallet}>
      <Loading text={'Initializing wallet'} />
    </div>;
  } else {
    if (!isConnected) {
      return <div className={styles.wallet}>
        {!isConnected && <LoadModule lib="Wallet/CreateWallet" />}
      </div>;
    }
    
    return <div className={styles.wallet}>
      <CopyAddress />
      <WalletBlock>
        <Balance />
      </WalletBlock>
      <WalletBlock>
        <Icons />
      </WalletBlock>
      <div className={styles.walletPortfolio}>
        <div className={styles.walletPortfolioTitle}>
          Portfolio balance
        </div>
        <WalletBlock frame>
          <Portfolio isMiningChecked={isMiningChecked} />
        </WalletBlock>
      </div>
      <Tokens />
    </div>;
  }
}

export default Wallet;
