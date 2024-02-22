import React from 'react';
import styles from './CreateWallet.module.scss';
import telegram from 'services/telegram';
import {ethers} from 'ethers';
import {useNavigate} from 'react-router-dom';
import routes from 'const/routes';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import toaster from 'services/toaster';
import {
  Icon,
} from '@blueprintjs/core';

function Mnemonic({setPrivateKey, showCreateWalletButton}) {
  
  const navigate = useNavigate();
  const [wallet, setWallet] = React.useState();
  const [mnemonic, setMnemonic] = React.useState('');
  const [key, setKey] = React.useState();
  
  React.useEffect(() => {
    const wallet = ethers.Wallet.createRandom();
    telegram.setMainButton({
      text: 'Continue',
      onClick: () => {
        setPrivateKey(wallet.privateKey);
        telegram.hideMainButton();
        telegram.clearBackActions();
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
