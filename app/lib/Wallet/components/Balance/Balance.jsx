import React from 'react';
import styles from './Balance.module.scss';
import {Web3Context} from "services/web3Provider";
import getFinePrice from "utils/getFinePrice";
import {Icon} from '@blueprintjs/core';
import get from "lodash/get";
import wei from "utils/wei";

function Balance() {
  
  const [gas, setGas] = React.useState(0);
  const {tokens} = React.useContext(Web3Context);
  
  React.useEffect(() => {
    const gasToken = tokens.find(t => !t.address);
    if (gasToken) {
      setGas(wei.from(get(gasToken, 'balance', "0"), gasToken.decimals));
    }
  }, [tokens])
  
  let balance = 0;
  tokens.map(token => {
    balance += (token.price || 0) * wei.from(token.balance || 0, token.decimals);
  })
  
  return <div className={styles.balance}>
    <div className={styles.balanceLeft}>
      <div className={styles.balanceTitle}>
        Total Balance
      </div>
      <div className={styles.balanceValue}>
        ${getFinePrice(balance)}
      </div>
    </div>
    <div className={styles.balanceRight}>
      <span className={styles.balanceGas}>
        {getFinePrice(gas)} SGB
      </span>
      <Icon icon={'flame'} />
    </div>
  </div>
}

export default Balance;
