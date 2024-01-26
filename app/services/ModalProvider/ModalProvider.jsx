import React from "react";

import { Overlay, Card } from "@blueprintjs/core";
import LoadModule from 'utils/async/load-module';
import styles from './ModalProvider.scss';

export const ModalContext = React.createContext();
let onClose;
function ModalProvider(props) {
  
  const [isOpen, setIsOpen] = React.useState(false);
  const [content, setContent] = React.useState();
  
  const openModal = (component = 'DefaultModal', params = {}) => {
    const overrideClose = typeof params.onClose === 'function'
      ? () => {
        params.onClose();
        setIsOpen(false);
      }
      : () => {
        setIsOpen(false);
      };
    setContent(<LoadModule modal={component} {...params} onClose={overrideClose} />);
    setIsOpen(true);
    onClose = overrideClose;
  }
  
  const defaultModal = params => openModal(undefined, params);
  const transactionSubmitted = params => openModal('TransactionSubmitted', params);
  const connectToWalletModal = params => openModal('ConnectToWalletModal/ConnectToWalletModal', params);
  const dexSettingsModal = params => openModal('DexSettingsModal/DexSettingsModal', params);
  const exchangerModal = params => openModal('ExchangerModal/ExchangerModal', params);
  const liquidityModal = params => openModal('LiquidityConfirmModal/LiquidityConfirmModal', {...params, transactionSubmitted});
  
  return <ModalContext.Provider className={"bp5-dark"} value={{
    defaultModal,
    transactionSubmitted,
    connectToWalletModal,
    dexSettingsModal,
    exchangerModal,
    liquidityModal,
  }}>
    {props.children}
    <Overlay isOpen={isOpen}
             portalClassName={"bp5-dark"}
             onClose={onClose}>
      <Card className={"modal-provider"}>
        {content}
      </Card>
    </Overlay>
  </ModalContext.Provider>
}

export default ModalProvider;
