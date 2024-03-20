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
import useWallet from "app/hooks/useWallet";
import useMining from "app/hooks/useMining";
import {WalletContext} from "lib/Wallet/walletProvider";

function Portfolio() {
  
  const {
    mining,
    isUserGranted,
  } = React.useContext(WalletContext);
  const {
    claimed,
    rewardPerSecond,
    sizeLimit,
    isClaiming,
    minedValue,
    minedPercents,
    isFull,
  } = mining;
  const {
    haptic,
    setBackAction,
  } = React.useContext(TelegramContext);
  const navigate = useNavigate();
  
  const onMining = async () => {
    haptic.click();
    setBackAction(() => {
      navigate(routes.wallet.path);
    })
    navigate(routes.walletMining.path);
  }
  
  const notReady = !isUserGranted || isClaiming;
  const spaceLeft = sizeLimit - minedValue;
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
            {getFinePrice(minedValue)}
          </div>
        </div>
      </div>
      <div className={styles.portfolioActionsRight}>
        <Button large
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
          width: `${minedPercents}%`,
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
