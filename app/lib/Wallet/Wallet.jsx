import React from 'react';
import styles from './Wallet.module.scss';
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

function Wallet() {
  
  const navigate = useNavigate();
  const {isConnected, tokens} = React.useContext(Web3Context);
  const telegram = React.useContext(TelegramContext);
  const {
    privateKey,
    setPrivateKey,
  } = telegram;
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    telegram.getPrivateKey().then(privateKey => {
      if (isConnected && privateKey) {
        telegram.clearBackActions();
        telegram.hideMainButton();
        //navigate(routes.exchange.path);
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
    }
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
    
    console.log('tokens', tokens);
    
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
