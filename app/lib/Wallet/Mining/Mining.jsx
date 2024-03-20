import React from 'react';
import styles from './Mining.module.scss';
import {Button} from "ui";
import getFinePrice from "utils/getFinePrice";
import {Web3Context} from "services/web3Provider";
import {TelegramContext} from "services/telegramProvider";
import PXLsABI from "const/ABI/PXLs";
import {wei} from "utils";
import toaster from "services/toaster";
import processError from "utils/processError";
import {useNavigate} from "react-router-dom";
import routes from "const/routes";
import WalletBlock from "ui/WalletBlock/WalletBlock";
import {Icon, Tooltip} from "@blueprintjs/core";
import Countdown from "../../ui/Countdown/Countdown";
import {useDispatch, useSelector} from "react-redux";
import {gaslessSelector} from "app/store/selectors";
import {appSetGasless} from "slices/App";
import get from "lodash/get";
import useMining from "app/hooks/useMining";
import {WalletContext} from "lib/Wallet/walletProvider";

let interval, _mined, start, _reward;
function Mining() {
  
  const {
    mining,
  } = React.useContext(WalletContext);
  const {
    gasToken,
    claimed,
    rewardPerSecond,
    sizeLimit,
    isClaiming,
    minedValue,
    minedPercents,
    onClaim,
    gasless,
    isFull,
  } = mining;
  const {
    haptic,
    setBackAction,
  } = React.useContext(TelegramContext);
  const navigate = useNavigate();
  
  const onNavigate = async (route) => {
    haptic.click();
    setBackAction(() => {
      navigate(routes.walletMining.path);
    })
    navigate(route.path);
  }
  
  const notReady = isClaiming;
  
  const spaceLeft = sizeLimit - minedValue;
  let secondsLeft = spaceLeft / rewardPerSecond;
  const hours = Math.floor(secondsLeft / 3600);
  secondsLeft %= 3600;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = Math.floor(secondsLeft % 60);
  const rewardPerHour = rewardPerSecond * 3600;
  const gas = wei.from(get(gasToken, 'balance', 0));
  
  const isDisabled = !isFull && gasless;

  return <div className={styles.mining}>
    <div className={styles.miningHeader}>
      <div className={styles.miningHeaderLogo}>
        <img src={require('styles/svg/logo_icon.svg')} alt={''} />
      </div>
      <div className={styles.miningHeaderBalance}>
        {getFinePrice(claimed)}
      </div>
      <div className={styles.miningHeaderMined}>
        <span className={styles.miningHeaderMinedStorage}>
          {getFinePrice(rewardPerHour)} PXLs / hour
        </span>
        {!!gasless
          ? <span className={styles.miningHeaderMinedGasless}>
                <Icon icon={'flame'} />
                <span>{gasless} gas free claims</span>
              </span>
          : <span className={!gas ? styles.miningHeaderMinedEmpty : styles.miningHeaderMinedGas}>
                <Icon icon={'flame'} />
                <span>{getFinePrice(gas)} SGB</span>
              </span>}
      </div>
    </div>
    <WalletBlock frame bold>
      <div className={styles.miningStorage}>
        <div className={styles.miningStorageText}>
          <div className={styles.miningStorageTextTitle}>
            Storage
          </div>
          <div className={styles.miningStorageTextStatus}>
            <span className={styles.miningStorageTextStatusStorage}>
              In storage {getFinePrice(minedValue)} PXLs
            </span>
          </div>
        </div>
        <div className={styles.miningStorageBar}>
          <div className={styles.miningStorageBarProgress} style={{
            width: `${minedPercents}%`,
          }} />
        </div>
      </div>
      <div className={styles.miningStorageActions}>
        {notReady ? <div className={styles.miningStorageActionsSpeed}>
            Calculating
          </div>
          : <div className={styles.miningStorageActionsSpeed}>
            {isFull ? 'Storage is full' : <>
              {hours}h {minutes}m {seconds}s to fill
            </>}
          </div>}
        <Button large
                disabled={!minedValue || isDisabled}
                loading={notReady}
                onClick={onClaim}>
          CLAIM PXLs
        </Button>
      </div>
    </WalletBlock>
    <WalletBlock className={styles.token}
                 onClick={() => {
                   window.open('https://docs.hellopixel.network/hello-pixel/pixel-wallet/how-to-mine-pixel', '_blank');
                 }}>
      <div className={styles.tokenInfo}>
        <div className={styles.tokenInfoIcon}>
          <img src={require('assets/mining/mining.png')} alt={''} />
        </div>
        <div className={styles.tokenInfoTitle}>
          <div className={styles.tokenInfoTitleSymbol}>
            How to Mine Pixel
          </div>
          <div className={styles.tokenInfoTitleName}>
            The more you know, the more you mine
          </div>
        </div>
      </div>
      <div className={styles.tokenBalance}>
        <div className={styles.tokenBalanceAction}>
          <Icon icon={'chevron-right'} />
        </div>
      </div>
    </WalletBlock>
    <WalletBlock className={styles.token}
                 onClick={() => {
                   window.open('https://docs.hellopixel.network/gamification/pixel-extractor', '_blank');
                 }}>
      <div className={styles.tokenInfo}>
        <div className={styles.tokenInfoIcon}>
          <img src={require('assets/mining/synthesizing.png')} alt={''} />
        </div>
        <div className={styles.tokenInfoTitle}>
          <div className={styles.tokenInfoTitleSymbol}>
            Start Synthesizing
          </div>
          <div className={styles.tokenInfoTitleName}>
            Generate Interdimensional Shift Box
          </div>
        </div>
      </div>
      <div className={styles.tokenBalance}>
        <div className={styles.tokenBalanceAction}>
          <Icon icon={'chevron-right'} />
        </div>
      </div>
    </WalletBlock>
    <div className={styles.miningButtons}>
      <div className={[styles.miningButton].join(' ')}
           onClick={() => onNavigate(routes.walletQuests)}>
        <div className={styles.miningButtonIcon}>
          <img src={require('assets/mining/mining1.png')} alt={''} />
        </div>
        <div className={styles.miningButtonText}>
          Quests
        </div>
      </div>
      <div className={[styles.miningButton].join(' ')}
           onClick={() => onNavigate(routes.walletBuild)}>
        <div className={styles.miningButtonIcon}>
          <img src={require('assets/mining/mining2.png')} alt={''} />
        </div>
        <div className={styles.miningButtonText}>
          Build
        </div>
      </div>
      <div className={[styles.miningButton].join(' ')}
           onClick={() => onNavigate(routes.walletFriends)}>
        <div className={styles.miningButtonIcon}>
          <img src={require('assets/mining/mining3.png')} alt={''} />
        </div>
        <div className={styles.miningButtonText}>
          Friends
        </div>
      </div>
      <div className={[styles.miningButton, 'disabled'].join(' ')}>
        <div className={styles.miningButtonIcon}>
          <img src={require('assets/mining/mining4.png')} alt={''} />
        </div>
        <div className={styles.miningButtonText}>
          Core
        </div>
      </div>
    </div>
  </div>
}

export default Mining;
