import React from 'react';
import styles from './History.module.scss';
import WalletBlock from "lib/Wallet/components/WalletBlock/WalletBlock";

function History({token}) {
  return <div className={styles.history}>
    <div className={styles.historyTitle}>
      History
    </div>
    <WalletBlock className={styles.historyBlock}>
      There is no history yet
    </WalletBlock>
  </div> ;
}

export default History;
