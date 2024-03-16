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
import WalletBlock from "lib/Wallet/components/WalletBlock/WalletBlock";
import {Icon, Tooltip} from "@blueprintjs/core";
import Countdown from "../../ui/Countdown/Countdown";
import {useDispatch, useSelector} from "react-redux";
import {gaslessSelector} from "app/store/selectors";
import {appSetGasless} from "slices/App";
import get from "lodash/get";

let interval, _mined, start, _reward;
function Mining() {
  
  const {
    isConnected,
    accountAddress,
    getContract,
    network,
    tokens,
    transaction,
    apiClaim,
  } = React.useContext(Web3Context);
  const {
    telegramId,
    haptic,
    setBackAction,
  } = React.useContext(TelegramContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const gasless = useSelector(gaslessSelector);
  const [token, setToken] = React.useState();
  const [gasToken, setGasToken] = React.useState();
  const [claimed, setClaimed] = React.useState(0);
  const [mined, setMined] = React.useState(0);
  const [rewardPerSecond, setRewardPerSecond] = React.useState(0.00001);
  const [sizeLimit, setSizeLimit] = React.useState(100);
  const [timestamp, setTimestamp] = React.useState();
  const [isClaiming, setIsClaiming] = React.useState(true);
  
  React.useEffect(() => {
    if (!isConnected) return;
    const token = tokens.find(t => t.symbol === 'PXLs');
    const gasToken = tokens.find(t => !t.address);
    if (token) {
      setToken(token);
    }
    if (gasToken) {
      setGasToken(gasToken);
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
      setClaimed(wei.from(data.claimed));
      _mined = wei.from(data.mined);
      _reward = wei.from(data.rewardPerSecond);
      setMined(_mined);
      setRewardPerSecond(_reward);
      setSizeLimit(wei.from(data.sizeLimit));
      
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
    if (!telegramId || !isConnected || !token) return;
    if (!network.contractAddresses.mining) return;
    loadData();
    
    return () => {
      clearInterval(interval);
    }
  }, [accountAddress, token])
  
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
      let tx;
      if (gasless) {
        tx = await apiClaim();
        dispatch(appSetGasless(tx.gasless));
      } else {
        const contract = await getContract(PXLsABI, network.contractAddresses.mining);
        tx = await transaction(contract, 'claimReward', [telegramId]);
      }
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
  
  const onFriends = async () => {
    haptic.click();
    setBackAction(() => {
      navigate(routes.walletMining.path);
    })
    navigate(routes.walletFriends.path);
  }
  
  const notReady = isClaiming;
  const isFull = value === sizeLimit;
  const spaceLeft = sizeLimit - value;
  let secondsLeft = spaceLeft / rewardPerSecond;
  const hours = Math.floor(secondsLeft / 3600);
  secondsLeft %= 3600;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = Math.floor(secondsLeft % 60);
  const rewardPerHour = rewardPerSecond * 3600;
  const gas = wei.from(get(gasToken, 'balance', 0));

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
              In storage {getFinePrice(value)} PXLs
            </span>
          </div>
        </div>
        <div className={styles.miningStorageBar}>
          <div className={styles.miningStorageBarProgress} style={{
            width: `${percents}%`,
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
                disabled={!value}
                loading={notReady}
                onClick={onClaim}>
          CLAIM PXLs
        </Button>
      </div>
    </WalletBlock>
    <WalletBlock className={styles.token}
                 onClick={() => {
                   window.open('https://docs.hellopixel.network/hello-pixel/pixel-wallet/how-to-mine-pixel');
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
      <div className={[styles.miningButton, 'disabled'].join(' ')}>
        <div className={styles.miningButtonIcon}>
          <img src={require('assets/mining/mining1.png')} alt={''} />
        </div>
        <div className={styles.miningButtonText}>
          Quests
        </div>
      </div>
      <div className={[styles.miningButton, 'disabled'].join(' ')}>
        <div className={styles.miningButtonIcon}>
          <img src={require('assets/mining/mining2.png')} alt={''} />
        </div>
        <div className={styles.miningButtonText}>
          Build
        </div>
      </div>
      <div className={[styles.miningButton].join(' ')} onClick={onFriends}>
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
