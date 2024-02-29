import React from 'react';
import styles from './WalletBlock.module.scss';

function WalletBlock({children, className, frame}) {
  const classNames = [styles.walletBlock];
  if (className) {
    classNames.push(className);
  }
  if (frame) {
    classNames.push(styles.framed);
    return <div className={classNames.join(' ')}>
      <div className={styles.walletBlockFrame}>
        {children}
      </div>
    </div>
  }
  
  return <div className={classNames.join(' ')}>
    {children}
  </div>
}

export default WalletBlock;
