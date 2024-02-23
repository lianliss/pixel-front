'use strict';
/**
 * @module app/contexts/Context
 */
import React from 'react';
import {Provider} from 'react-redux';
import Web3Provider from "services/web3Provider";
import ModalProvider from "services/ModalProvider";

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
        <Web3Provider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </Web3Provider>
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
