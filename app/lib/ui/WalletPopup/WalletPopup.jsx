import React from 'react';
import styles from './WalletPopup.module.scss';
import {useDispatch} from "react-redux";
import {appSetIsHideMenuButton} from "slices/App";

function WalletPopup({
                       children,
                       className,
                       onClose = () => {},
                       onOpen = () => {},
                       onUnmount = () => {},
}) {
  const dispatch = useDispatch();
  const classes = [
    styles.walletPopupContainer,
  ];
  if (className) {
    classes.push(className);
  }
  
  React.useEffect(() => {
    onOpen();
    dispatch(appSetIsHideMenuButton(true));
    return () => {
      dispatch(appSetIsHideMenuButton(false));
      onUnmount();
    };
  }, []);
  
  return <div className={styles.walletPopup}>
    <div className={styles.walletPopupOverlay}
         onClick={onClose} />
    <div className={classes.join(' ')}>
      {children}
    </div>
  </div>
}

export default WalletPopup;
