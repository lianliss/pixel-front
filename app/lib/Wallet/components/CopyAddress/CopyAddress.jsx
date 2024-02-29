import React from 'react';
import styles from './CopyAddress.module.scss';
import {Web3Context} from "services/web3Provider";
import toaster from "services/toaster";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {
  Icon,
} from '@blueprintjs/core';


function CopyAddress() {
  const {accountAddress} = React.useContext(Web3Context);
  
  return <div className={styles.copyAddress}>
    <CopyToClipboard text={accountAddress}
                     className={styles.copyAddressContent}
                     onCopy={() => {
                       console.log('COPY', accountAddress);
                       toaster.show({
                         intent: 'warning',
                         message: <>
                           Address <b>{accountAddress}</b><br/>
                           copied to clipboard
                         </>,
                         icon: 'clipboard',
                       })
                     }}>
      <div>
        <span className={styles.copyAddressText}>
          {accountAddress.slice(0, 6) + '...' + accountAddress.slice(accountAddress.length - 4)}
        </span>
        <Icon icon={'duplicate'} size={14} />
      </div>
    </CopyToClipboard>
  </div>
}

export default CopyAddress;
