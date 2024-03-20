import React from 'react';
import styles from './Logout.module.scss';
import {WalletPopup} from "ui";
import {TelegramContext} from "services/telegramProvider";
import {useNavigate} from "react-router-dom";
import routes from "const/routes";

function Logout({onClose}) {
  
  const {
    haptic,
    clearPrivateKey,
    setMainButton,
    hideMainButton,
  } = React.useContext(TelegramContext);
  const navigate = useNavigate();
  const walletPath = routes.wallet.path;
  
  React.useEffect(() => {
    setMainButton({
      text: 'Clear Private Key',
      onClick: () => {
        haptic.error();
        clearPrivateKey();
        navigate(walletPath);
      },
    })
  }, []);
  
  const onThisClose = () => {
    hideMainButton();
    onClose();
    haptic.soft();
  }
  
  return <WalletPopup onClose={onThisClose} className={styles.keys}>
    <p>
      Logging out will erase
      your private key
      <br/>from the application
    </p>
    <p>
      <b>Please make sure you have saved your private key.</b>
    </p>
  </WalletPopup>
}

export default Logout;
