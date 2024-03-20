import React from 'react';
import styles from './Build.module.scss';
import getFinePrice from "utils/getFinePrice";
import PXLsABI from "const/ABI/PXLs";
import {wei} from "utils";
import {Web3Context} from "services/web3Provider";
import {TelegramContext} from "services/telegramProvider";
import WalletBlock from "ui/WalletBlock/WalletBlock";
import {Icon} from "@blueprintjs/core";
import toaster from "services/toaster";
import processError from "../../../../utils/processError";
import {WalletPopup} from "ui";
import useMining from "app/hooks/useMining";
import {WalletContext} from "lib/Wallet/walletProvider";

const baseSpeed = 0.01;
const sizeLevels = [
  {
    image: require('assets/mining/size/0.jpg'),
    value: baseSpeed * 2,
    price: 0,
  },
  {
    image: require('assets/mining/size/1.jpg'),
    value: baseSpeed * 3,
    price: 0.2,
  },
  {
    image: require('assets/mining/size/2.jpg'),
    value: baseSpeed * 4,
    price: 0.5,
  },
  {
    image: require('assets/mining/size/3.jpg'),
    value: baseSpeed * 6,
    price: 1,
  },
  {
    image: require('assets/mining/size/4.jpg'),
    value: baseSpeed * 12,
    price: 4,
  },
  {
    image: require('assets/mining/size/5.jpg'),
    value: baseSpeed * 24,
    price: 10,
  },
  {
    image: require('assets/mining/size/6.jpg'),
    value: 0,
    price: 100,
  },
];
const speedLevels = [
  {
    image: require('assets/mining/speed/0.jpg'),
    value: baseSpeed,
    price: 0,
  },
  {
    image: require('assets/mining/speed/1.jpg'),
    value: baseSpeed * 1.5,
    price: 0.2,
  },
  {
    image: require('assets/mining/speed/2.jpg'),
    value: baseSpeed * 2,
    price: 1,
  },
  {
    image: require('assets/mining/speed/3.jpg'),
    value: baseSpeed * 2.5,
    price: 2,
  },
  {
    image: require('assets/mining/speed/4.jpg'),
    value: baseSpeed * 3,
    price: 5,
  },
  {
    image: require('assets/mining/speed/5.jpg'),
    value: baseSpeed * 5,
    price: 15,
  },
]
function Build() {
  
  const {
    mining,
  } = React.useContext(WalletContext);
  const {
    loadMiningData,
    claimed,
    rewardPerSecond,
    sizeLimit,
    sizeLevel,
    speedLevel,
  } = mining;
  const {
    getContract,
    network,
    transaction,
    loadAccountBalances,
  } = React.useContext(Web3Context);
  const {
    telegramId,
    haptic,
    setMainButton,
    hideMainButton,
    mainButtonLoading,
  } = React.useContext(TelegramContext);
  const [method, setMethod] = React.useState();
  
  const rewardPerHour = rewardPerSecond * 3600;
  const size = sizeLevels[sizeLevel];
  const nextSize = sizeLevels[sizeLevel + 1];
  const speed = speedLevels[speedLevel];
  const nextSpeed = speedLevels[speedLevel + 1];
  
  const onUpgrade = async (method) => {
    try {
      const name = method === 'buySizeLevel'
        ? 'Storage'
        : 'Drill';
      mainButtonLoading(true);
      const contract = await getContract(PXLsABI, network.contractAddresses.mining);
      await transaction(contract, method, [telegramId]);
      loadAccountBalances();
      await loadMiningData();
      toaster.success(`${name} upgraded`);
      haptic.success();
    } catch (error) {
      console.error('[onUpgrade]', error);
      const details = processError(error);
      haptic.error();
      if (details.isGas) {
        toaster.gas(details.gas);
      } else {
        toaster.error(details.message);
      }
    }
    hideMainButton();
    setMethod();
  }
  
  const onMethod = (method) => {
    const isStorage = method === 'buySizeLevel';
    setMethod(method);
    setMainButton({
      text: 'UPGRADE',
      onClick: () => onUpgrade(method),
      isDisabled: isStorage && !nextSize.value,
      isLoading: false,
    });
  }
  
  const renderUpgrade = () => {
    const isStorage = method === 'buySizeLevel';
    const level = isStorage ? size : speed;
    const next = isStorage ? nextSize : nextSpeed;
    const getClaim = levelValue => {
      const value = levelValue / baseSpeed;
      const hours = Math.floor(value);
      const minutes = Math.floor((value - hours) * 60);
      return minutes
        ? `${hours}h ${minutes}m`
        : `${hours}h`;
    }
    
    return <WalletPopup className={styles.upgrade}
                        onClose={() => {
                          setMethod();
                          hideMainButton();
                        }}>
      <h2>{isStorage ? 'Storage' : 'Drill'}</h2>
      <p>
        {isStorage
          ? 'Increased storage allows you to hold a larger amount of mined PXLs'
          : 'Improved drill allows you to get more PXLs per hour'}
      </p>
      <div className={styles.upgradeTokens}>
        <WalletBlock className={styles.upgradeToken}>
          <div className={styles.upgradeTokenInfo}>
            <div className={styles.upgradeTokenInfoIcon}>
              <img src={next.image} alt={''} />
            </div>
            <div className={styles.upgradeTokenInfoTitle}>
              <div className={styles.upgradeTokenInfoTitleLevel}>
                {isStorage ? sizeLevel + 1 : speedLevel + 1} level
              </div>
              <div className={styles.upgradeTokenInfoTitleText}>
                {isStorage
                  ? next.value
                    ? `Claim every ${getClaim(next.value)}`
                    : 'Unlimited storage'
                  : `Mine ${getFinePrice(next.value)} PXLs/hour`}
              </div>
            </div>
          </div>
        </WalletBlock>
        <Icon icon={'double-chevron-up'} />
        <WalletBlock className={styles.upgradeToken}>
          <div className={styles.upgradeTokenInfo}>
            <div className={styles.upgradeTokenInfoIcon}>
              <img src={level.image} alt={''} />
            </div>
            <div className={styles.upgradeTokenInfoTitle}>
              <div className={styles.upgradeTokenInfoTitleLevel}>
                {isStorage ? sizeLevel : speedLevel} level
              </div>
              <div className={styles.upgradeTokenInfoTitleText}>
                {isStorage
                  ? level.value
                    ? `Claim every ${getClaim(level.value)}`
                    : 'Unlimited storage'
                  : `Mine ${getFinePrice(level.value)} PXLs/hour`}
              </div>
            </div>
          </div>
        </WalletBlock>
      </div>
      <div className={styles.upgradeCost}>
        <img src={require('styles/svg/logo_icon.svg')}
             alt={'PXLs'} /> {getFinePrice(next.price)}
      </div>
    </WalletPopup>;
  }
  
  return <div className={styles.build}>
    <div className={styles.buildHeader}>
      <div className={styles.buildHeaderLogo}>
        <img src={require('styles/svg/logo_icon.svg')} alt={''} />
      </div>
      <div className={styles.buildHeaderBalance}>
        {getFinePrice(claimed)}
      </div>
      <div className={styles.buildHeaderMined}>
        <div className={styles.buildHeaderMinedStorage}>
          Storage size: <span>{getFinePrice(sizeLimit)}</span> PXLs
        </div>
        <div className={styles.buildHeaderMinedStorage}>
          Mining speed: <span>{getFinePrice(rewardPerHour)}</span> PXLs / hour
        </div>
      </div>
    </div>
    <WalletBlock className={styles.token}
                 onClick={() => {
                   onMethod('buySizeLevel');
                 }}>
      <div className={styles.tokenInfo}>
        <div className={styles.tokenInfoIcon}>
          <img src={size.image} alt={''} />
        </div>
        <div className={styles.tokenInfoTitle}>
          <div className={styles.tokenInfoTitleSymbol}>
            Storage
          </div>
          <div className={styles.tokenInfoTitleName}>
            Increase the storage capacity<br/>
            of the mined
          </div>
          <div className={styles.tokenInfoTitleParams}>
            <div className={styles.tokenInfoTitleParamsItem}>
              <Icon icon={'layers'} />
              <span>
                {sizeLevel}
              </span>
            </div>
            <div className={styles.tokenInfoTitleParamsItem}>
              {nextSize ? <>
                <Icon icon={'double-chevron-up'} />
                <span>
                  {getFinePrice(nextSize.price)} <span>upgrade cost</span>
                </span>
              </> : 'Completed'}
            </div>
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
                   onMethod('buySpeedLevel');
                 }}>
      <div className={styles.tokenInfo}>
        <div className={styles.tokenInfoIcon}>
          <img src={speed.image} alt={''} />
        </div>
        <div className={styles.tokenInfoTitle}>
          <div className={styles.tokenInfoTitleSymbol}>
            Drill
          </div>
          <div className={styles.tokenInfoTitleName}>
            Increase mining speed
          </div>
          <div className={styles.tokenInfoTitleParams}>
            <div className={styles.tokenInfoTitleParamsItem}>
              <Icon icon={'layers'} />
              <span>
                {speedLevel}
              </span>
            </div>
            <div className={styles.tokenInfoTitleParamsItem}>
              {nextSpeed ? <>
                <Icon icon={'double-chevron-up'} />
                <span>
                  {getFinePrice(nextSpeed.price)} <span>upgrade cost</span>
                </span>
              </> : 'Completed'}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.tokenBalance}>
        <div className={styles.tokenBalanceAction}>
          <Icon icon={'chevron-right'} />
        </div>
      </div>
    </WalletBlock>
    {!!method && renderUpgrade()}
  </div>
}

export default Build;
