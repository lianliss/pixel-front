import React from 'react';
import styles from './TokenHeader.module.scss';
import getFinePrice from "utils/getFinePrice";

function TokenHeader({token}) {
  
  const {name, logoURI, balance, price, symbol} = token;
  
  return <div className={styles.tokenHeader}>
    <div className={styles.tokenHeaderTitle}>
      <div className={styles.tokenHeaderTitleIcon}>
        <img src={logoURI} alt={symbol} />
      </div>
      <div className={styles.tokenHeaderTitleSymbol}>
        {name}
      </div>
    </div>
    <div className={styles.tokenHeaderPrice}>
      1 {symbol} ≈ ${getFinePrice(Number(price) || 0)}
    </div>
  </div>
}

export default TokenHeader;
