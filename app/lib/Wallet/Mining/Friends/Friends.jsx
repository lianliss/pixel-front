import React from 'react';
import styles from './Friends.module.scss';
import {TelegramContext} from "services/telegramProvider";
import {Loading} from "utils/async/load-module";
import {wei} from "utils";
import {Icon, Tooltip} from "@blueprintjs/core";
import ReactTimeAgo from "react-time-ago";
import getFinePrice from "utils/getFinePrice";
import WalletBlock from "lib/Wallet/components/WalletBlock/WalletBlock";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import toaster from "services/toaster";
import userImage from 'assets/img/avatar.png';
import {Web3Context} from "services/web3Provider";
import LogsDecoder from 'logs-decoder';
import topics from 'const/topics/mining';
import ABI from 'const/ABI/PXLs';
import {decodeParameter} from 'web3-eth-abi';
import copy from 'copy-to-clipboard';

import {toNumber} from 'web3-utils';

TimeAgo.addDefaultLocale(en);

function processLog(log) {
  try {
    const logsDecoder = LogsDecoder.create();
    logsDecoder.addABI(ABI);
    const logs = logsDecoder.decodeLogs([log]);
    return logs.map(log => {
      const events = {};
      log.events.map(event => {
        const {type, value, name} = event;
        if (type !== 'address') {
          try {
            event.value = decodeParameter(type, value);
          } catch (error) {
          
          }
        }
        events[name] = event.value;
      })
      return events;
    });
  } catch (error) {
    console.error('[processLog]', error);
  }
}

function Friends() {
  
  const {
    apiGetTelegramFriends,
    apiGetRewardsLogs,
    blocksPerSecond,
    network,
  } = React.useContext(Web3Context);
  const {
    telegramId,
    haptic,
    setMainButton,
    hideMainButton,
  } = React.useContext(TelegramContext);
  const [friends, setFriends] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [other, setOther] = React.useState(0);
  
  const loadFriends = async () => {
    try {
      const friends = await apiGetTelegramFriends();
      return friends.filter(t => !!t.telegramId);
    } catch (error) {
      console.error('[Friends][loadFriends]', error);
    }
  }
  
  const getLogs = async () => {
    try {
      const logs = await apiGetRewardsLogs();
      const tx = logs.map(processLog);
      console.log('tx', tx);
      const rewards = {};
      tx.map(log => {
        const claimer = toNumber(log[0].claimerId);
        if (typeof rewards[claimer] === 'undefined') {
          rewards[claimer] = 0;
        }
        rewards[claimer] += wei.from(log[0].amount);
      })
      return rewards;
    } catch (error) {
      console.error('[Friends][getLogs]', error);
    }
  }
  
  const copyLink = async () => {
    haptic.click();
    copy(`https://t.me/pixel_wallet_bot?start=${telegramId}`);
    haptic.success();
    toaster.warning('Your referral link copied to clipboard');
  }
  
  React.useEffect(() => {
    Promise.allSettled([loadFriends(), getLogs()]).then(data => {
      const friends = data[0].value;
      const rewards = data[1].value;
      let total = 0;
      let unknownTotal = 0;
      if (rewards) {
        friends.map(friend => {
          friend.amount = rewards[friend.telegramId] || 0;
          total += friend.amount;
          delete rewards[friend.telegramId];
        })
        const unknown = Object.keys(rewards);
        unknown.map(telegramId => {
          unknownTotal += rewards[telegramId];
        })
      }
      setFriends(friends);
      setTotal(total);
      setOther(unknownTotal);
      setIsLoading(false);
    }).catch(error => {
      console.error('[Friends]', error);
      setFriends([]);
      setIsLoading(false);
    })
    setMainButton({
      text: 'Copy Invite Link',
      onClick: copyLink,
    })
    return () => {
      hideMainButton();
    }
  }, [telegramId])
  
  let content;
  if (isLoading) {
    content = <div className={styles.friendsList}>
      <Loading text={'Searching for friends'} />
    </div>
  } else {
    content = friends.length
      ? <div className={styles.friendsList}>
        {friends.map((friend, index) => {
          const {
            created,
            telegramUserName,
            telegramFirstName,
            telegramLastName,
            telegramId,
            amount,
          } = friend;
          const valuesClassName = [styles.friendsEventValuesAmount];
          const time = created;
          const name = `${telegramFirstName || ''} ${telegramLastName || ''}`.trim();
          return <div className={styles.friendsEvent} key={index}>
            <div className={styles.friendsEventData}>
              <div className={styles.friendsEventDataIcon}>
                <img src={userImage} alt={''} />
              </div>
              <div className={styles.friendsEventDataText}>
                <Tooltip content={telegramUserName}>
                  <a href={`https://t.me/${telegramUserName}`}
                     className={styles.friendsEventDataAction}>
                    {name.length ? name : telegramUserName}
                  </a>
                </Tooltip>
                <div className={styles.friendsEventDataDate}>
                  <Tooltip content={(new Date(time)).toLocaleString()}>
                    <ReactTimeAgo date={time} locale="en-US" />
                  </Tooltip>
                </div>
              </div>
            </div>
            <div className={styles.friendsEventValues}>
              <div className={valuesClassName.join(' ')}>
                {getFinePrice(amount)}
              </div>
            </div>
          </div>
        })}
      </div>
      : <div className={styles.friendsNoFriends}>There is no friends yet</div>;
  }
  
  return <div className={styles.friends}>
    <div className={styles.friendsHeader}>
      <div className={styles.friendsHeaderAmount}>
        {friends.length} friend{friends.length !== 1 && 's'}
      </div>
      <p>
        You will receive 20% of the PXLs
        <br/>
        mined by your friend and 5% of the
        <br/>
        PXLs mined by your friend's friend
      </p>
      <p>
        <a href={'https://docs.hellopixel.network/hello-pixel/pixel-wallet/refer-a-friend'}>
          Full guide
        </a>
      </p>
      <p>
        <b>Received last week</b>
        <br/>
        <div className={styles.fiendsStats}>
          <span>{getFinePrice(total)}</span> from friends
          <br/>
          <span>{getFinePrice(other)}</span> from friends of friends
        </div>
      </p>
    </div>
    <div className={styles.friendsTitle}>
      My Friends
    </div>
    <WalletBlock className={styles.friendsBlock}>
      {content}
    </WalletBlock>
  </div>
}

export default Friends;
