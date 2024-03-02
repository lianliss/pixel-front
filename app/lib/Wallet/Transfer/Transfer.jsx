import React from 'react';
import styles from './Transfer.module.scss';
import {useMatch, useNavigate} from 'react-router-dom';
import routes from 'const/routes';
import {Web3Context} from "services/web3Provider";
import getFinePrice from "utils/getFinePrice";
import {TelegramContext} from "services/telegramProvider";
import TokenHeader from "lib/Wallet/components/TokenHeader/TokenHeader";
import WalletBlock from "lib/Wallet/components/WalletBlock/WalletBlock";
import {Button, Input} from "ui";
import {Button as BPButton, Tooltip} from "@blueprintjs/core";
import {isAddress as web3IsAddress, toChecksumAddress} from 'web3-utils';
import wei from "utils/wei";

function Transfer() {
  
  const navigate = useNavigate();
  const routePath = routes.walletTransfer.path;
  const match = useMatch(routePath);
  const {
    scanQR,
    mainButtonEnable,
    mainButtonDisable,
    setMainButton,
    hideMainButton,
  } = React.useContext(TelegramContext);
  const {symbol} = match.params;
  const {tokens} = React.useContext(Web3Context);
  console.log('match', match);
  
  const [token, setToken] = React.useState({});
  React.useEffect(() => {
    setToken(tokens.find(t => t.symbol === symbol));
  }, [symbol, tokens]);
  
  const [address, setAddress] = React.useState('');
  const [value, setValue] = React.useState(0);
  
  const {name, logoURI, balance, price, decimals} = token;
  
  const onQrClick = () => {
    scanQR(code => {
      if (web3IsAddress(code)) {
        setAddress(code);
        return true;
      } else {
        return false;
      }
    }, 'Scan recipient address by QR-code');
  }
  
  const onTransfer = () => {
    console.log('onTransfer');
  }
  
  React.useEffect(() => {
    if (web3IsAddress(address) && value >= Number(balance)) {
      mainButtonEnable();
    } else {
      mainButtonDisable();
    }
  }, [address, value]);
  
  React.useEffect(() => {
    setMainButton({
      text: 'Transfer',
      onClick: onTransfer,
      isDisabled: true,
    })
    return () => {
      hideMainButton();
    }
  }, [])
  
  if (!token.symbol) return <></>;
  
  return <div className={styles.transfer}>
    <TokenHeader token={token} />
    <div className={styles.transferContainer}>
      <h1>
        Transfer
      </h1>
      <WalletBlock title={'Recipient address'}>
        <Input value={address}
               placeholder={'0xa38d84...'}
               indicator={<Tooltip content={'Scan QR-code'}>
                 <BPButton icon={'detection'}
                                    onClick={onQrClick}
                                    minimal
                                    className={styles.transferScan} />
               </Tooltip>}
               onTextChange={setAddress} />
      </WalletBlock>
      <WalletBlock title={'Amount'}>
        <Input value={value}
               placeholder={'0'}
               type={'number'}
               indicator={<Button className={styles.transferMax}
                                  onClick={() => {
                                    setValue(wei.from(balance, decimals))
                                  }}>Max</Button>}
               onTextChange={setValue} />
      </WalletBlock>
    </div>
  </div>
}

export default Transfer;
