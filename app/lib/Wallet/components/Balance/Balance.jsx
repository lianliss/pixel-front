import React from 'react';
import styles from './Balance.module.scss';
import {Web3Context} from "services/web3Provider";
import getFinePrice from "utils/getFinePrice";
import {Icon} from '@blueprintjs/core';
import get from "lodash/get";

function Balance() {
  
  const [gas, setGas] = React.useState(0);
  const {tokens} = React.useContext(Web3Context);
  
  React.useEffect(() => {
    const gasToken = tokens.find(t => !t.address);
    if (gasToken) {
      setGas(get(gasToken, 'balance', 0));
    }
  }, [tokens])
  
  return <div className={styles.balance}>
    <div className={styles.balanceLeft}>
      <div className={styles.balanceTitle}>
        Total Balance
      </div>
      <div className={styles.balanceValue}>
        ${getFinePrice(0)}
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
