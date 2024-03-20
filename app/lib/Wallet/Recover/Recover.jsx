import React from 'react';
import styles from './Recover.module.scss';
import WalletBlock from "ui/WalletBlock/WalletBlock";
import {Button as BPButton} from "@blueprintjs/core/lib/esm/components/button/buttons";
import {Tooltip} from "@blueprintjs/core";
import {Input} from "ui";
import {TelegramContext} from "services/telegramProvider";
import {ethers} from 'ethers';
import {Web3Context} from "services/web3Provider";

function Recover() {
  
  const {
    mainButtonEnable,
    mainButtonDisable,
    setMainButton,
    hideMainButton,
    readFromClipboard,
    setPrivateKey,
    clearBackActions,
    haptic,
  } = React.useContext(TelegramContext);
  const {
    connectPixelWallet,
  } = React.useContext(Web3Context);
  const [seed, setSeed] = React.useState('');
  const [privateKey, _setPrivateKey] = React.useState('');
  const [isSeed, setIsSeed] = React.useState(false);
  const [isPrivate, setIsPrivate] = React.useState(false);
  
  const onRecover = (isSeed) => {
    try {
      haptic.click();
      const wallet = isSeed
        ? ethers.Wallet.fromPhrase(seed)
        : new ethers.Wallet(privateKey);
      setPrivateKey(wallet.privateKey);
      hideMainButton();
      clearBackActions();
      connectPixelWallet(wallet.privateKey);
    } catch (error) {
      console.error('[onRecover]', error);
      haptic.error();
    }
  }
  
  const onSeedPasteClick = async () => {
    haptic.soft();
    setSeed(await readFromClipboard());
  }
  
  const onPrivateKeyPasteClick = async () => {
    haptic.soft();
    setPrivateKey(await readFromClipboard());
  }
  
  React.useEffect(() => {
    setMainButton({
      text: 'Recover',
      onClick: onRecover,
      isDisabled: true,
    });
  }, [])
  
  React.useEffect(() => {
    try {
      if (typeof seed !== 'string') throw new Error('Not string');
      if (seed.split(' ').length !== 12) throw new Error('Not 12 words');
      const wallet = ethers.Wallet.fromPhrase(seed);
      setIsSeed(true);
      setMainButton({
        text: 'Recover from seed',
        onClick: () => onRecover(true),
        isDisabled: false,
      })
    } catch (error) {
      mainButtonDisable();
      setIsSeed(false);
    }
  }, [seed])
  
  React.useEffect(() => {
    try {
      const wallet = new ethers.Wallet(privateKey);
      setIsPrivate(true);
      setMainButton({
        text: 'Recover from key',
        onClick: () => onRecover(false),
        isDisabled: false,
      })
    } catch (error) {
      mainButtonDisable();
      setIsPrivate(false);
    }
  }, [privateKey])
  
  return <div className={styles.recover}>
    <h2>
      Recover wallet
    </h2>
    {!isPrivate && <WalletBlock title={'Seed phrase'}>
      <Input value={seed}
             placeholder={'words...'}
             onClick={() => haptic.tiny()}
             indicator={<Tooltip content={'Paste from clipboard'}>
               <BPButton icon={'clipboard'}
                         onClick={onSeedPasteClick}
                         minimal
                         className={styles.recoverPaste} />
             </Tooltip>}
             onTextChange={setSeed} />
    </WalletBlock>}
    {(!isSeed && !isPrivate) && <h2>
      or
    </h2>}
    {!isSeed && <WalletBlock title={'Private Key'}>
      <Input value={privateKey}
             placeholder={'0xA29b9...'}
             onClick={() => haptic.tiny()}
             indicator={<Tooltip content={'Paste from clipboard'}>
               <BPButton icon={'clipboard'}
                                  onClick={onPrivateKeyPasteClick}
                                  minimal
                         className={styles.recoverPaste} />
             </Tooltip>}
             onTextChange={_setPrivateKey} />
    </WalletBlock>}
  </div>
}

export default Recover;
