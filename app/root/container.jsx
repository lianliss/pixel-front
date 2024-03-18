'use strict';
import React from 'react';
import {connect} from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';
import {bindActionCreators} from 'redux';
import LoadModule, {Loading} from 'utils/async/load-module';
import get from 'lodash/get';
import {appUpdateAccount, appSetAdaptive} from 'slices/App';
import Router from './router';
import 'process';
import {IS_TELEGRAM} from "const";
import {adaptiveSelector} from "app/store/selectors";
import {TelegramContext} from "services/telegramProvider";
import {Web3Context} from "services/web3Provider";

function AppContainer() {
  
  const dispatch = useDispatch();
  const isAdaptive = useSelector(adaptiveSelector);
  const telegram = React.useContext(TelegramContext);
  const web3Context = React.useContext(Web3Context);
  const [isLoading, setIsLoading] = React.useState(true);
  
  function onResize() {
    if (IS_TELEGRAM) {
      dispatch(appSetAdaptive(true));
      return;
    }
    if (isAdaptive && window.innerWidth >= 800) {
      dispatch(appSetAdaptive(false));
    }
    if (!isAdaptive && window.innerWidth < 800) {
      dispatch(appSetAdaptive(true));
    }
  }
  
  React.useEffect(() => {
    window.addEventListener("resize", onResize.bind(this));
    onResize();
    if (IS_TELEGRAM) {
      telegram.getPrivateKey().then(privateKey => {
        web3Context.connectPixelWallet(privateKey);
        setIsLoading(false);
      }).catch(error => {
        console.error('[container][getPrivateKey]', error);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
    return () => {
      window.removeEventListener("resize", onResize.bind(this));
    }
  }, []);
  
  const className = [
    'container',
    'bp5-dark',
  ];
  if (IS_TELEGRAM) {
    className.push('telegram');
  }
  
  if (isLoading) {
    return <Loading />;
  }
  
  return (
    <div className={className.join(' ')}>
      <Router />
    </div>
  );
}

export default connect(state => ({
  account: get(state, 'App.account'),
  adaptive: get(state, 'App.adaptive'),
}), dispatch => bindActionCreators({
  appUpdateAccount,
  appSetAdaptive,
}, dispatch), null, {pure: true})(AppContainer);
