import React from 'react';
import styles from './WalletBlock.module.scss';

function WalletBlock({
                       children,
                       className,
                       frame,
                       title,
                       onClick = () => {},
}) {
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
    {!!title && <div className={styles.walletBlockTitle}>
      {title}
    </div>}
    {children}
  </div>
}

export default WalletBlock;
