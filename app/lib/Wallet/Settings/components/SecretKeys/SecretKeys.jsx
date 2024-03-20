import React from 'react';
import styles from './SecretKeys.module.scss';
import {WalletPopup} from "ui";
import {CopyToClipboard} from "react-copy-to-clipboard";
import toaster from "services/toaster";
import {Icon} from "@blueprintjs/core";
import {TelegramContext} from "services/telegramProvider";
import {ethers} from "ethers";
import copy from 'copy-to-clipboard';

function SecretKeys({onClose}) {
  
  const {
    haptic,
    privateKey,
    setMainButton,
    hideMainButton,
    mainButtonPrimary,
  } = React.useContext(TelegramContext);
  
  const showToaster = () => {
    toaster.show({
      intent: 'warning',
      message: <>
        Private key copied to clipboard
      </>,
      icon: 'clipboard',
    })
  }
  
  React.useEffect(() => {
    setMainButton({
      text: 'Copy Private Key',
      onClick: () => {
        haptic.success();
        showToaster();
        copy(privateKey);
        mainButtonPrimary(true);
      },
    })
  }, []);
  
  const onThisClose = () => {
    hideMainButton();
    onClose();
    haptic.soft();
  }
  
  return <WalletPopup onClose={onThisClose} className={styles.keys}>
    <p>
      This private key can be used to import the wallet
      <br/>into Metamask or other applications
      <br/>that support Ether wallets.
    </p>
    <CopyToClipboard text={privateKey}
                     onCopy={() => {
                       haptic.medium();
                       showToaster()
                     }}>
      <div className={styles.keysCopy}>
        <div className={styles.keysCopyText}>
          {privateKey}
        </div>
        <Icon className={styles.keysCopyIcon} icon={'clipboard'} />
      </div>
    </CopyToClipboard>
    <p>
      <b>Do not share your private key with anyone
        <br/>and keep it in a safe place</b>
    </p>
  </WalletPopup>
}

export default SecretKeys;
