'use strict';
/**
 * Module Combines Reducers and Creates Redux Store per
 * @module app/store
 * @namespace App.Store
 */
import {configureStore} from '@reduxjs/toolkit'
import reducer from "app/store/reducer";
import {syncTranslationWithStore, setLocale, loadTranslations} from 'react-redux-i18n';
import promise from 'redux-promise';
import thunk from 'redux-thunk';
import Root from 'root';
import {APP_DEFAULT_LANGUAGE} from 'const';
import {appStateInitialize} from "slices/App";
import { setAutoFreeze } from 'immer';

/**
 * @function initStore
 * @param {store} redux store
 * @memberof module:app/store
 */
export const initStore = ({store, state}) => {
    if (!store) throw new Error('missing [store]');
    if (!state) throw new Error('missing [state]');
    store.dispatch(appStateInitialize(state));
};
/**
 * @function createStore
 * @param {Object} state - state to initialize
 * @memberof module:app/store
 */
export const createStore = ({state = {}, init = true} = {}) => {
    const store = configureStore({
        reducer,
        middleware: [promise, thunk],
        devTools: true,
    });

    if (init && Object.keys(state).length) initStore({store, state});
    syncTranslationWithStore(store); // Turn on translations synchronization
    //store.dispatch(loadTranslations(translationsObject)); // Load all translations
    store.dispatch(setLocale(APP_DEFAULT_LANGUAGE));

    return store;
};
/**
 * First Redux Store Instance from the Root
 * Exporting redux store instance for legacy code relying on direct import of Store and {dispatch}
 * @constant Store
 * @memberof module:app/store
 * @return {ReduxStore}
 */
export const
    Store = {
        state: {
            id: 0,
            store: undefined,
        },
        get: id => {
            Store.state.id = Store.state.id || id;
            Store.state.store = Store.state.store || Root.getStore(Store.state.id);
            return Store.state.store;
        },
        dispatch: action => Store.get(Store.state.id).dispatch(action),
        getState: () => Store.get(Store.state.id).getState()
    };
export const dispatch = Store.dispatch;
export const getState = Store.getState;
setAutoFreeze(false);
export default Store;

