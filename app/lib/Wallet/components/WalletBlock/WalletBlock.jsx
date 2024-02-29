import React from 'react';
import styles from './WalletBlock.module.scss';

function WalletBlock({children, className, frame, onClick = () => {}}) {
  const classNames = [styles.walletBlock];
  if (className) {
    classNames.push(className);
  }
  if (frame) {
    classNames.push(styles.framed);
    return <div className={classNames.join(' ')}
                onClick={onClick}>
      <div className={styles.walletBlockFrame}>
        {children}
      </div>
    </div>
  }
  
  return <div className={classNames.join(' ')}
              onClick={onClick}>
    {children}
  </div>
}

export default WalletBlock;
