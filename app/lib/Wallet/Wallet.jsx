import React from 'react';
import styles from './Wallet.module.scss';
import telegram from 'services/telegram';
import LoadModule from  'utils/async/load-module';
import {Web3Context} from "services/web3Provider";
import {useNavigate} from 'react-router-dom';
import routes from 'const/routes';

function Wallet() {
  
  const navigate = useNavigate();
  const {isConnected} = React.useContext(Web3Context);
  const [privateKey, setPrivateKey] = React.useState();
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    setIsLoading(true);
    telegram.init();
    telegram.getPrivateKey().then(key => {
      setIsLoading(false);
      if (isConnected) {
        telegram.clearBackActions();
        telegram.hideMainButton();
        navigate(routes.exchange.path);
      }
    }).catch(error => {
      setIsLoading(false);
      console.log('[Wallet]', error);
    })
  }, [isConnected]);
  
  if (isLoading) {
    return <div className={styles.wallet}>
      <LoadModule.renderLoading />
    </div>;
  } else {
    return <div className={styles.wallet}>
      {!isConnected && <LoadModule lib="Wallet/CreateWallet" setPrivateKey={setPrivateKey} />}
    </div>;
  }
}

export default Wallet;
