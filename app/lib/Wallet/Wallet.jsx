import React from 'react';
import styles from './Wallet.module.scss';
import telegram from 'services/telegram';
import LoadModule from  'utils/async/load-module';

function Wallet() {
  
  const [privateKey, setPrivateKey] = React.useState();
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    telegram.init();
    telegram.getPrivateKey().then(key => {
      setIsLoading(false);
      setPrivateKey(key);
    }).catch(error => {
      setIsLoading(false);
      console.log('[Wallet]', error);
    })
  }, []);
  
  if (isLoading) {
    return <div className={styles.wallet}>
      <LoadModule.renderLoading />
    </div>;
  } else {
    return <div className={styles.wallet}>
      <LoadModule lib="Wallet/CreateWallet" setPrivateKey={setPrivateKey} />
    </div>;
  }
}

export default Wallet;
