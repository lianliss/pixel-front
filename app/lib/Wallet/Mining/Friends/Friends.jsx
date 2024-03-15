import React from 'react';
import styles from './Friends.module.scss';
import api from 'utils/async/api/mining';
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

TimeAgo.addDefaultLocale(en);

function Friends() {
  
  const {
    telegramId,
    haptic,
    setMainButton,
    hideMainButton,
  } = React.useContext(TelegramContext);
  const [friends, setFriends] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const friends = await api.getFriends(telegramId);
      setFriends(friends.filter(t => !!t.telegramId));
    } catch (error) {
      console.error('[Friends][loadFriends]', error);
    }
    setIsLoading(false);
  }
  
  const copyLink = async () => {
    haptic.click();
    await navigator.clipboard.writeText(`https://t.me/pixel_wallet_bot?start=${telegramId}`);
    haptic.success();
    toaster.warning('Your referral link copied to clipboard');
  }
  
  React.useEffect(() => {
    loadFriends();
    setMainButton({
      text: 'Invite a friend',
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
                {getFinePrice(0)}
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
