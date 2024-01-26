'use strict';
/**
 * @module app/contexts/Context
 */
import React from 'react';
import {Provider} from 'react-redux';

export const Context = React.createContext({});
export const ContextConsumer = Component => props => (
    <Context.Consumer>
        {values => <Component {...props} contextValues={values} />}
    </Context.Consumer>
);
export const ContextProvider = ({id, store, shadowNode, children}) => (
    <Context.Provider value={{id, store, shadowNode}}>
        <Provider store={store}>
            {children}
        </Provider>
    </Context.Provider>
);

export const StrictMode = props => props.disabled
    ? props.children
    : <React.StrictMode>
        {props.children}
        </React.StrictMode>;

export default ContextProvider;
