'use strict';
/**
 * @module app/contexts/Context
 */
import React from 'react';
import {Provider} from 'react-redux';
import Web3Provider from "services/web3Provider";
import ModalProvider from "services/ModalProvider";
import TelegramProvider from "services/telegramProvider";
import WalletProvider from "lib/Wallet/walletProvider";

export const Context = React.createContext({});
export const ContextConsumer = Component => props => (
    <Context.Consumer>
        {values => <Component {...props} contextValues={values} />}
    </Context.Consumer>
);

export const ContextProvider = ({id, store, shadowNode, children}) => (
  <StrictMode disabled>
    <Context.Provider value={{id, store, shadowNode}}>
      <Provider store={store}>
        <TelegramProvider>
          <Web3Provider>
            <WalletProvider>
              <ModalProvider>
                {children}
              </ModalProvider>
            </WalletProvider>
          </Web3Provider>
        </TelegramProvider>
      </Provider>
    </Context.Provider>
  </StrictMode>
);

export const StrictMode = props => props.disabled
    ? props.children
    : <React.StrictMode>
        {props.children}
        </React.StrictMode>;

export default ContextProvider;
