import React from 'react';
import styles from './History.module.scss';
import WalletBlock from "lib/Wallet/components/WalletBlock/WalletBlock";
import {Web3Context} from "services/web3Provider";
import historyApi from "utils/async/api/history";
import ReactTimeAgo from 'react-time-ago';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import getFinePrice from "utils/getFinePrice";
import {wei} from "utils";
import {Loading} from 'utils/async/load-module';
import {Icon, Tooltip} from "@blueprintjs/core";
import {CHAIN_TOKENS} from "services/multichain/initialTokens";

TimeAgo.addDefaultLocale(en);

function History({token}) {
  
  const {
    chainId,
    isConnected,
    accountAddress,
    tokens,
    apiGetHistory,
    apiGetTokenHistory,
  } = React.useContext(Web3Context);
  const [history, setHistory] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const chainToken = CHAIN_TOKENS[chainId];
  
  React.useEffect(() => {
    if (!token || !isConnected) return;
    setIsLoading(true);
    const promise = token.symbol === chainToken.symbol
      ? apiGetHistory()
      : apiGetTokenHistory(token.address)
    promise.then(result => {
      setIsLoading(false);
      setHistory(result);
    })
  }, [chainId, isConnected])
  
  const accountLowerCase = accountAddress.toLowerCase();
  let content;
  if (isLoading) {
    content = <div className={styles.historyList}>
      <Loading text={'Searching for history'} />
    </div>
  } else {
    content = history.length
      ? <div className={styles.historyList}>
        {history.map((event, index) => {
          const {timeStamp, value} = event;
          const tokenDecimal = token.decimals;
          const isIncome = event.to === accountLowerCase;
          const valuesClassName = [styles.historyEventValuesAmount];
          const gasPrice = wei.from(event.gasPrice, 18);
          const gas = gasPrice * Number(event.gasUsed);
          const time = timeStamp * 1000;
          if (!isIncome) {
            valuesClassName.push('negative');
          }
          return <div className={styles.historyEvent} key={index}>
            <div className={styles.historyEventData}>
              <div className={styles.historyEventDataAction}>
                {isIncome ? 'Receive' : 'Send'}
              </div>
              <div className={styles.historyEventDataDate}>
                <Tooltip content={(new Date(time)).toLocaleString()}>
                  <ReactTimeAgo date={time} locale="en-US" />
                </Tooltip>
              </div>
            </div>
            <div className={styles.historyEventValues}>
              <div className={valuesClassName.join(' ')}>
                {getFinePrice(wei.from(value, Number(tokenDecimal)))}
              </div>
              {!isIncome && <div className={styles.historyEventValuesGas}>
                <Icon icon={'flame'} size={10} /> {getFinePrice(gas)} SGB
              </div>}
            </div>
          </div>
        })}
      </div>
      : <div className={styles.historyNoHistory}>There is no history yet</div>;
  }
  
  return <div className={styles.history}>
    <div className={styles.historyTitle}>
      History
    </div>
    <WalletBlock className={styles.historyBlock}>
      {content}
    </WalletBlock>
  </div> ;
}

export default History;
