import React from 'react';
import styles from './Portfolio.module.scss';
import {Button} from "ui";
import logo from 'styles/svg/logo_icon.svg';
import getFinePrice from "utils/getFinePrice";
import {Web3Context} from "services/web3Provider";
import {TelegramContext} from "services/telegramProvider";
import PXLsABI from "const/ABI/PXLs";
import {wei} from "utils";
import toaster from "services/toaster";
import processError from "utils/processError";
import {useNavigate} from "react-router-dom";
import routes from "const/routes";
import Countdown from "../../../ui/Countdown/Countdown";

let interval, _mined, start, _reward;

function Portfolio({isMiningChecked}) {
  
  const {
    isConnected,
    accountAddress,
    getContract,
    network,
    tokens,
    transaction,
    apiGetTelegramUser,
  } = React.useContext(Web3Context);
  const {
    telegramId,
    haptic,
    setBackAction,
  } = React.useContext(TelegramContext);
  const navigate = useNavigate();
  const [token, setToken] = React.useState();
  const [claimed, setClaimed] = React.useState(0);
  const [mined, setMined] = React.useState(0);
  const [rewardPerSecond, setRewardPerSecond] = React.useState(0.00001);
  const [sizeLimit, setSizeLimit] = React.useState(100);
  const [timestamp, setTimestamp] = React.useState();
  const [isClaiming, setIsClaiming] = React.useState(true);
  
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
      let data = await Promise.all([
        contract.methods.getStorage(telegramId).call(),
        contract.methods.balanceOf(accountAddress).call(),
      ]);
      if (!data[0].claimTimestamp) {
        await apiGetTelegramUser(true);
        data = await Promise.all([
          contract.methods.getStorage(telegramId).call(),
          contract.methods.balanceOf(accountAddress).call(),
        ]);
      }
      console.log('data', data);
      setClaimed(wei.from(data[1]));
      _mined = wei.from(data[0].mined);
      _reward = wei.from(data[0].rewardPerSecond);
      setMined(_mined);
      setRewardPerSecond(_reward);
      setSizeLimit(wei.from(data[0].sizeLimit));
      
      start = Date.now();
      setTimestamp(Date.now());
      
      clearInterval(interval);
      interval = setInterval(increaseMined, 1000);
    } catch (error) {
      console.error('[Portfolio]', error);
    }
    setIsClaiming(false);
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
    haptic.click();
    try {
      const contract = await getContract(PXLsABI, network.contractAddresses.mining);
      const tx = await transaction(contract, 'claimReward', [telegramId]);
      toaster.success('Pixel Shards claimed');
      haptic.success();
      console.log('[onClaim]', tx);
      await loadData();
      haptic.tiny();
    } catch (error) {
      console.error('[onClaim]', error);
      const details = processError(error);
      haptic.error();
      if (details.isGas) {
        toaster.gas(details.gas);
      } else {
        toaster.error(details.message);
      }
    }
    setIsClaiming(false);
  }
  
  const onMining = async () => {
    haptic.click();
    setBackAction(() => {
      navigate(routes.wallet.path);
    })
    navigate(routes.walletMining.path);
  }
  
  const notReady = !isMiningChecked || isClaiming;
  const isFull = value === sizeLimit;
  const spaceLeft = sizeLimit - value;
  let secondsLeft = spaceLeft / rewardPerSecond;
  const hours = Math.floor(secondsLeft / 3600);
  secondsLeft %= 3600;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = Math.floor(secondsLeft % 60);
  
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
                onClick={onMining}
        >
          MINING
        </Button>
      </div>
    </div>
    <div className={styles.portfolioStorage}>
      <div className={styles.portfolioStorageText}>
        <div className={styles.portfolioStorageTextTitle}>
          Storage
        </div>
        {notReady ? <div className={styles.portfolioStorageTextStatus}>
            Calculating
          </div>
          : <div className={styles.portfolioStorageTextStatus}>
            {isFull ? 'Storage is full' : <>
              {hours}h {minutes}m {seconds}s to fill
            </>}
        </div>}
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
