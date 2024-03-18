import React from 'react';
import styles from './Quests.module.scss';
import {TelegramContext} from "services/telegramProvider";
import {Web3Context} from "services/web3Provider";
import routes from "const/routes";
import WalletBlock from "lib/Wallet/components/WalletBlock/WalletBlock";
import getFinePrice from "utils/getFinePrice";
import wei from "utils/wei";
import {Icon} from "@blueprintjs/core";
import {useDispatch} from "react-redux";
import {appSetGasless} from "slices/App";

const images = [
  require('assets/social/telegram-45px.svg'),
];

const links = [
  'https://t.me/hellopixelverse',
  'https://twitter.com/hellopixelverse',
];

function Quests() {
  
  const {
    haptic,
    setMainButton,
    hideMainButton,
    mainButtonLoading,
    mainButtonStop,
  } = React.useContext(TelegramContext);
  const {
    apiGetQuests,
    apiCheckQuests,
    apiGetGasless,
    apiTwitterQuest,
  } = React.useContext(Web3Context);
  
  const dispatch = useDispatch();
  const [quests, setQuests] = React.useState([]);
  
  const getQuests = async () => {
    try {
      setQuests(await apiGetQuests());
    } catch (error) {
      console.error('[Quests][getQuests]', error);
    }
  }
  const checkQuests = async () => {
    try {
      mainButtonLoading();
      setQuests(await apiCheckQuests());
      haptic.warning();
      dispatch(appSetGasless((await apiGetGasless()).gasless))
    } catch (error) {
      console.error('[Quests][getQuests]', error);
    }
    mainButtonStop();
  }
  React.useEffect(() => {
    getQuests().then(() => {
      checkQuests();
    });
    setMainButton({
      text: 'Check progress',
      onClick: () => {
        haptic.click();
        checkQuests();
      },
    })
    return () => {
      hideMainButton();
    }
  }, []);
  
  return <div className={styles.quests}>
    <p>
      Complete quests and receive gasless
      <br/>
      transactions to claim Pixel Shards
    </p>
    <div className={styles.questsList}>
      {quests.map((quest) => {
        const {title, description, gasBonus, image, index, isDone, link} = quest;
        const img = image
          || images[index]
          || require('assets/mining/synthesizing.png');
        const url = link || links[index];
        
        
        return <WalletBlock className={styles.token}
                            onClick={() => {
                              haptic.small();
                              window.open(url, '_blank');
                              if (index === 1) {
                                setTimeout(apiTwitterQuest, 2000);
                              }
                            }}
                            key={index}>
          <div className={styles.tokenInfo}>
            <div className={styles.tokenInfoIcon}>
              <img src={img} alt={index} />
            </div>
            <div className={styles.tokenInfoTitle}>
              <div className={styles.tokenInfoTitleSymbol}>
                {title}
              </div>
              <div className={styles.tokenInfoTitleName}>
                {description}
              </div>
            </div>
          </div>
          <div className={styles.tokenBalance}>
            <div className={styles.tokenBalanceText}>
              <div className={styles.tokenBalanceTextAmount}>
                {!!gasBonus ? `${gasBonus} free claim` : 'Custom reward'}
              </div>
              <div className={[styles.tokenBalanceTextValue, isDone ? 'completed' : ''].join(' ')}>
                {isDone ? 'Completed' : 'Incomplete'}
              </div>
            </div>
            <div className={styles.tokenBalanceAction}>
              <Icon icon={'chevron-right'} />
            </div>
          </div>
        </WalletBlock>
      })}
    </div>
  </div>
}

export default Quests;