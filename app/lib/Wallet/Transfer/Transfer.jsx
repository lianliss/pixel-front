import React from 'react';
import styles from './Transfer.module.scss';
import {useMatch, useNavigate} from 'react-router-dom';
import routes from 'const/routes';
import {Web3Context} from "services/web3Provider";
import getFinePrice from "utils/getFinePrice";
import {TelegramContext} from "services/telegramProvider";
import TokenHeader from "lib/Wallet/components/TokenHeader/TokenHeader";
import WalletBlock from "ui/WalletBlock/WalletBlock";
import {Button, Input} from "ui";
import {Button as BPButton, Tooltip} from "@blueprintjs/core";
import {isAddress as web3IsAddress, toChecksumAddress} from 'web3-utils';
import wei from "utils/wei";
import toaster from "services/toaster";
import {processError} from "utils";

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
    mainButtonLoading,
    mainButtonStop,
    haptic,
  } = React.useContext(TelegramContext);
  const {symbol} = match.params;
  const {
    tokens,
    sendTokens,
    getContract,
    loadAccountBalances,
    updateTokenBalance,
    getTokenBalance,
  } = React.useContext(Web3Context);
  
  const [token, setToken] = React.useState({});
  React.useEffect(() => {
    setToken(tokens.find(t => t.symbol === symbol));
  }, [symbol, tokens]);
  
  const [address, setAddress] = React.useState('');
  const [value, setValue] = React.useState(0);
  
  const {name, logoURI, balance, price, decimals} = token;
  
  const onQrClick = () => {
    haptic.soft();
    scanQR(code => {
      if (web3IsAddress(code)) {
        setAddress(code);
        return true;
      } else {
        return false;
      }
    }, 'Scan recipient address by QR-code');
  }
  
  const onTransfer = async () => {
    haptic.click();
    mainButtonLoading(true);
    try {
      const result = await sendTokens(token, address, value);
      const hash = result.transactionHash;
      
      // Redirect to token page
      navigate(routes.walletToken.path.replace(':symbol', symbol));
      const shortAddress = address.slice(0, 6)
        + '...'
        + address.slice(address.length - 4);
      toaster.success(<>{getFinePrice(value)} {symbol} successfully<br/>sent to {shortAddress}</>);
      haptic.success();
      
      // Update current token balance
      try {
        updateTokenBalance(token.address, await getTokenBalance(token.address));
      } catch (error) {
        console.error('[onTransfer] updateTokenBalance', error);
      }
    } catch (error) {
      console.error('[onTransfer]', error);
      haptic.error();
      const details = processError(error);
      if (details.isGas) {
        toaster.gas(details.gas);
      } else {
        toaster.error(details.message);
      }
    }
    mainButtonStop(true);
  }
  
  React.useEffect(() => {
    if (web3IsAddress(address) && value <= wei.from(balance, decimals) && value > 0) {
      setMainButton({
        text: 'Transfer',
        onClick: onTransfer,
        isDisabled: false,
      })
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
               onClick={() => haptic.tiny()}
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
               onClick={() => haptic.tiny()}
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
