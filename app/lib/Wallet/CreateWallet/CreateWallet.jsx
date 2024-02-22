import React from 'react';
import styles from './CreateWallet.module.scss';
import telegram from 'services/telegram';
import logo from 'styles/svg/logo_icon.svg';
import Mnemonic from "./Mnemonic";

function CreateWallet({setPrivateKey}) {
  
  const [isCreate, setIsCreate] = React.useState(false);
  
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
  }, [])
  
  if (isCreate) {
    return <Mnemonic setPrivateKey={setPrivateKey} />;
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
