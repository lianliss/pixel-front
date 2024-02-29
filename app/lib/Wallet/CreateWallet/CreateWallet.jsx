import React from 'react';
import styles from './CreateWallet.module.scss';
import logo from 'styles/svg/logo_icon.svg';
import Mnemonic from "./Mnemonic";
import {TelegramContext} from "services/telegramProvider";

function CreateWallet() {
  
  const [isCreate, setIsCreate] = React.useState(false);
  const telegram = React.useContext(TelegramContext);
  
  const showCreateWalletButton = () => {
    telegram.setMainButton({
      text: 'Create new wallet',
      onClick: () => {
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
  
  if (isCreate) {
    return <Mnemonic />;
  }
  
  return <div className={styles.createWallet}>
    <img className={styles.createWalletLogo} src={logo} alt={""}/>
    <h1>PIXEL Wallet</h1>
    <p>
      A seamless multi-chain Wallet from
      <br/>
      Gamified SocialFi Pixel Ecosystem
    </p>
    <div className={styles.createWalletRecovery}>
      Wallet Recovery
    </div>
  </div>
}

export default CreateWallet;
