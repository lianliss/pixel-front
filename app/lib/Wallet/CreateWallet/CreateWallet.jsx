import React from 'react';
import styles from './CreateWallet.module.scss';
import logo from 'styles/svg/logo_icon.svg';
import Mnemonic from "./Mnemonic";
import {TelegramContext} from "services/telegramProvider";
import Recover from "lib/Wallet/Recover";

function CreateWallet() {
  
  const [isCreate, setIsCreate] = React.useState(false);
  const [isRecover, setIsRecover] = React.useState(false);
  const telegram = React.useContext(TelegramContext);
  
  const showCreateWalletButton = () => {
    telegram.setMainButton({
      text: 'Create new wallet',
      onClick: () => {
        console.log('CREATE!!!');
        setIsCreate(true);
        telegram.setBackAction(() => {
          setIsCreate(false);
          telegram.clearBackActions();
          showCreateWalletButton();
        })
      },
    });
  }
  
  React.useEffect(() => {
    showCreateWalletButton();
    return () => {
      telegram.hideMainButton();
      telegram.clearBackActions();
    }
  }, [])
  
  const onRecover = () => {
    setIsRecover(true);
    telegram.setBackAction(() => {
      setIsRecover(false);
      showCreateWalletButton();
    });
  }
  
  if (isCreate) {
    return <Mnemonic />;
  }
  
  if (isRecover) {
    return <Recover />;
  }
  
  return <div className={styles.createWallet}>
    <img className={styles.createWalletLogo} src={logo} alt={""}/>
    <h1>PIXEL Wallet</h1>
    <p>
      A seamless multi-chain Wallet from
      <br/>
      Gamified SocialFi Pixel Ecosystem
    </p>
    <div className={styles.createWalletRecovery} onClick={onRecover}>
      Wallet Recovery
    </div>
  </div>
}

export default CreateWallet;
