import React from 'react';
import styles from './Wallet.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import LoadModule, {Loading} from  'utils/async/load-module';
import {Web3Context} from "services/web3Provider";
import {useNavigate} from 'react-router-dom';
import {TelegramContext} from "services/telegramProvider";
import CopyAddress from "lib/Wallet/components/CopyAddress/CopyAddress";
import WalletBlock from "ui/WalletBlock/WalletBlock";
import Balance from "lib/Wallet/components/Balance/Balance";
import Icons from "lib/Wallet/components/Icons/Icons";
import Portfolio from "lib/Wallet/components/Portfolio/Portfolio";
import Tokens from "lib/Wallet/components/Tokens/Tokens";
import toaster from "services/toaster";
import {appSetGasless} from "slices/App";
import useWallet from "app/hooks/useWallet";
import {WalletContext} from "lib/Wallet/walletProvider";

function Wallet() {
  
  const {
    isKeyLoading,
  } = React.useContext(WalletContext);
  const {
    isConnected,
  } = React.useContext(Web3Context);
  
  if (isKeyLoading) {
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
          <Portfolio />
        </WalletBlock>
      </div>
      <Tokens />
    </div>;
  }
}

export default Wallet;
