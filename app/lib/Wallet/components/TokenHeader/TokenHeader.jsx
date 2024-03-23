import React from 'react';
import styles from './TokenHeader.module.scss';
import getFinePrice from "utils/getFinePrice";
import {Web3Context} from "services/web3Provider";
import {wei} from "utils";
import {Icon} from "@blueprintjs/core";

function TokenHeader({token, gas, showBalance}) {
  
  const {
    network,
  } = React.useContext(Web3Context);
  const {
    defaultToken,
  } = network;
  const {name, logoURI, balance, price, symbol, decimals} = token;
  
  return <div className={styles.tokenHeader}>
    <div className={styles.tokenHeaderTitle}>
      <div className={styles.tokenHeaderTitleIcon}>
        <img src={logoURI} alt={symbol} />
      </div>
      <div className={styles.tokenHeaderTitleSymbol}>
        {showBalance ? `${getFinePrice(wei.from(balance, decimals))} ${symbol}` : name}
      </div>
    </div>
    {gas && defaultToken ? <div className={styles.tokenHeaderPrice}>
      <Icon icon={'flame'}/>
      <span>
        {getFinePrice(wei.from(defaultToken.balance, defaultToken.decimals))} {defaultToken.symbol}
      </span>
    </div> : <div className={styles.tokenHeaderPrice}>
      1 {symbol} ≈ ${getFinePrice(Number(price) || 0)}
    </div>}
  </div>
}

export default TokenHeader;
