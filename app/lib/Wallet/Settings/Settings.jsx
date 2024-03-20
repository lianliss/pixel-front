import React from 'react';
import styles from './Settings.module.scss';
import {Icon} from "@blueprintjs/core";
import SecretKeys from "lib/Wallet/Settings/components/SecretKeys/SecretKeys";
import {WalletBlock} from "ui";
import Logout from "lib/Wallet/Settings/components/Logout/Logout";
import {TelegramContext} from "services/telegramProvider";

const ICON_SIZE = 24;

function Settings() {
  
  const {haptic} = React.useContext(TelegramContext);
  const [isKeys, setIsKeys] = React.useState(false);
  const [isLogout, setIsLogout] = React.useState(false);
  
  return <div className={styles.settings}>
    <h2>
      Settings
    </h2>
    <WalletBlock className={styles.settingsButton} onClick={() => {
      haptic.click();
      setIsKeys(true);
    }}>
      <div className={styles.settingsButtonLeft}>
        <div className={styles.settingsButtonLeftIcon}>
          <Icon icon={'key'} size={ICON_SIZE} />
        </div>
        <div className={styles.settingsButtonLeftTitle}>
          <div className={styles.settingsButtonLeftTitleText}>
            Show Private Key
          </div>
          <div className={styles.settingsButtonLeftTitleHint}>
            Get your private key
          </div>
        </div>
      </div>
      <div className={styles.settingsButtonRight}>
        <div className={styles.settingsButtonRightAction}>
          <Icon icon={'chevron-right'} />
        </div>
      </div>
    </WalletBlock>
    <WalletBlock className={styles.settingsButton} onClick={() => {
      haptic.click();
      setIsLogout(true);
    }}>
      <div className={styles.settingsButtonLeft}>
        <div className={styles.settingsButtonLeftIcon}>
          <Icon icon={'log-out'} size={ICON_SIZE} />
        </div>
        <div className={styles.settingsButtonLeftTitle}>
          <div className={styles.settingsButtonLeftTitleText}>
            Logout
          </div>
          <div className={styles.settingsButtonLeftTitleHint}>
            Log out of your account and forget your private key
          </div>
        </div>
      </div>
      <div className={styles.settingsButtonRight}>
        <div className={styles.settingsButtonRightAction}>
          <Icon icon={'chevron-right'} />
        </div>
      </div>
    </WalletBlock>
    {isKeys && <SecretKeys onClose={() => setIsKeys(false)} />}
    {isLogout && <Logout onClose={() => setIsLogout(false)} />}
  </div>
}

export default Settings;
