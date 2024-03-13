import React from 'react';
import styles from './Portfolio.module.scss';
import {Button} from "ui";
import logo from 'styles/svg/logo_icon.svg';
import getFinePrice from "utils/getFinePrice";
import {Web3Context} from "services/web3Provider";
import {TelegramContext} from "services/telegramProvider";
import PXLsABI from "const/ABI/PXLs";
import {wei} from "utils";
import {setIn} from "immutable";
import {transaction} from "services/web3Provider/methods";
import toaster from "services/toaster";
import processError from "utils/processError";

let interval, _mined, start, _reward;

function Portfolio({isMiningChecked}) {
  
  const {
    isConnected,
    accountAddress,
    getContract,
    network,
    tokens,
    transaction,
  } = React.useContext(Web3Context);
  const {
    telegramId,
  } = React.useContext(TelegramContext);
  const [token, setToken] = React.useState();
  const [claimed, setClaimed] = React.useState(0);
  const [mined, setMined] = React.useState(0);
  const [rewardPerSecond, setRewardPerSecond] = React.useState(0);
  const [sizeLimit, setSizeLimit] = React.useState(100);
  const [timestamp, setTimestamp] = React.useState();
  const [isClaiming, setIsClaiming] = React.useState(false);
  
  React.useEffect(() => {
    if (!isConnected) return;
    const token = tokens.find(t => t.symbol === 'PXLs');
    if (token) {
      setToken(token);
    }
  }, [isConnected, tokens]);
  
  const increaseMined = () => {
    const seconds = (Date.now() - start) / 1000;
    setMined(_mined + seconds * _reward);
    setTimestamp(Date.now());
  }
  
  const loadData = async () => {
    try {
      const contract = await getContract(PXLsABI, network.contractAddresses.mining);
      const data = await contract.methods.getStorage(telegramId).call();
      console.log('DATA', data);
      setClaimed(wei.from(data.claimed));
      _mined = wei.from(data.mined);
      _reward = wei.from(data.rewardPerSecond);
      setMined(_mined);
      setRewardPerSecond(_reward);
      setSizeLimit(wei.from(data.sizeLimit));
      
      start = Date.now();
      setTimestamp(Date.now());
      
      interval = setInterval(increaseMined, 1000);
    } catch (error) {
      console.error('[Portfolio]', error);
    }
  }
  
  React.useEffect(() => {
    if (!telegramId || !isConnected || !isMiningChecked || !token) return;
    if (!network.contractAddresses.mining) return;
    loadData();
    
    return () => {
      clearInterval(interval);
    }
  }, [accountAddress, isMiningChecked, token])
  
  const value = mined > sizeLimit
    ? sizeLimit
    : mined;
  
  const percents = sizeLimit
    ? value / sizeLimit * 100
    : 0;
  
  const onClaim = async () => {
    setIsClaiming(true);
    try {
      const contract = await getContract(PXLsABI, network.contractAddresses.mining);
      const tx = await transaction(contract, 'claimReward', [telegramId]);
      toaster.success('Pixel Shards claimed');
      console.log('[onClaim]', tx);
      await loadData();
    } catch (error) {
      console.error('[onClaim]', error);
      const details = processError(error);
      if (details.isGas) {
        toaster.gas(details.gas);
      } else {
        toaster.error(details.message);
      }
    }
    setIsClaiming(false);
  }
  
  const notReady = !isMiningChecked || isClaiming;
  
  return <div className={styles.portfolio}>
    <div className={styles.portfolioActions}>
      <div className={styles.portfolioActionsLeft}>
        <div className={styles.portfolioActionsIcon}>
          <img src={logo} alt={'logo'} />
        </div>
        <div className={styles.portfolioActionsTitle}>
          <div className={styles.portfolioActionsTitleTop}>
            Pixel Shard
          </div>
          <div className={styles.portfolioActionsTitleBottom}>
            {getFinePrice(value)}
          </div>
        </div>
      </div>
      <div className={styles.portfolioActionsRight}>
        <Button large
                disabled={!value}
                loading={notReady}
                onClick={onClaim}>
          Claim
        </Button>
      </div>
    </div>
    <div className={styles.portfolioStorage}>
      <div className={styles.portfolioStorageText}>
        <div className={styles.portfolioStorageTextTitle}>
          Storage
        </div>
        <div className={styles.portfolioStorageTextStatus}>
          {notReady ? 'Calculating' : 'Ready to claim'}
        </div>
      </div>
      <div className={styles.portfolioStorageBar}>
        <div className={styles.portfolioStorageBarProgress} style={{
          width: `${percents}%`,
        }} />
      </div>
    </div>
    <div className={styles.portfolioHarvested}>
      Harvested:
      <span>{getFinePrice(claimed)}</span>
    </div>
  </div>
}

export default Portfolio;
