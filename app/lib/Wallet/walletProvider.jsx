import React from "react";
import useWallet from "app/hooks/useWallet";
import useMining from "app/hooks/useMining";
import {IS_TELEGRAM} from "const";
import {Web3Context} from "services/web3Provider";
import {TelegramContext} from "services/telegramProvider";
import {useNavigate} from "react-router-dom";
import routes from "const/routes";

export const WalletContext = React.createContext();

function WalletProvider(props) {
  
  if (!IS_TELEGRAM) {
    return <WalletContext.Provider value={{}}>
      {props.children}
    </WalletContext.Provider>
  }
  
  const {isConnected} = React.useContext(Web3Context);
  const {
    setSettingsButton,
    hideSettingsButton,
  } = React.useContext(TelegramContext);
  const wallet = useWallet();
  const mining = useMining();
  
  React.useEffect(() => {
    if (isConnected) {
    
    } else {
    
    }
  }, [isConnected]);
  
  return <WalletContext.Provider value={{
    ...wallet,
    mining,
  }}>
    {props.children}
  </WalletContext.Provider>
}

export default WalletProvider;
