import React from 'react';
import styles from './CreateWallet.module.scss';
import {ethers} from 'ethers';
import {useNavigate} from 'react-router-dom';
import routes from 'const/routes';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import toaster from 'services/toaster';
import {
  Icon,
} from '@blueprintjs/core';
import {Web3Context} from "services/web3Provider";
import {TelegramContext} from "services/telegramProvider";

function Mnemonic() {
  
  const context = React.useContext(Web3Context);
  const {connectPixelWallet} = context;
  const telegram = React.useContext(TelegramContext);
  const {
    setPrivateKey,
  } = telegram;
  const navigate = useNavigate();
  const [mnemonic, setMnemonic] = React.useState('');
  
  React.useEffect(() => {
    const wallet = ethers.Wallet.createRandom();
    telegram.setMainButton({
      text: 'Continue',
      onClick: async () => {
        setPrivateKey(wallet.privateKey);
        telegram.hideMainButton();
        telegram.clearBackActions();
        await telegram.setPrivateKey(wallet.privateKey);
        connectPixelWallet(wallet.privateKey);
        navigate(routes.exchange.path);
      },
    })
    setMnemonic(wallet.mnemonic.phrase);
  }, []);
  
  return <div className={styles.createWalletMnemonic}>
    <h1>Create Wallet</h1>
    <p>
      Save this phrase in a safe place. With it you can restore your wallet at any time
    </p>
    <CopyToClipboard text={mnemonic}
                     onCopy={() => toaster.show({
                       intent: 'warning',
                       message: <>
                         Secret phrase copied to clipboard
                       </>,
                       icon: 'clipboard',
                     })}>
      <div className={styles.createWalletMnemonicCopy}>
        <div className={styles.createWalletMnemonicCopyText}>
          {mnemonic}
        </div>
        <Icon className={styles.createWalletMnemonicCopyIcon} icon={'clipboard'} />
      </div>
    </CopyToClipboard>
  </div>;
}

export default Mnemonic;
