import React from 'react';
import { useSelector } from 'react-redux';

import ExchangerSwap from './components/ExchangerSwap/ExchangerSwap';
import { Tab, Tabs } from "@blueprintjs/core";
import {
  useNavigate,
  useMatch,
} from 'react-router-dom';
import routes from 'const/routes';
import LoadModule from 'utils/async/load-module';


// Utils
import _ from 'lodash';
import useExchanger from 'app/hooks/useExchanger';
import { Web3Context } from 'services/web3Provider';

// Styles
import './Exchanger.scss';

function ExchangerContent() {
  const {
    fiatTokens,
    coins,
    fiatSelected,
    coinSelected,
    setFiat,
    setCoin,
    isAdaptive,
    fiatsLoaded,
  } = useExchanger();
  
  return <div className="Exchanger">
    <h2>Exchange</h2>
    <p>
      Trade tokens in an instant
    </p>
    <div className="Exchanger__content">
      <ExchangerSwap
        fiats={fiatTokens}
        fiatsLoaded={fiatsLoaded}
        coins={coins}
        fiat={fiatSelected || fiatTokens[0]}
        coin={coinSelected}
        setFiat={setFiat}
        setCoin={setCoin}
      />
    </div>
  </div>;
}

function LiquidityContent() {
  return <LoadModule lib={"Liquidity/Liquidity"} />
}

function Exchanger() {
  const { accountAddress, isConnected, chainId } =
    React.useContext(Web3Context);
  const navigate = useNavigate();
  const matchLiquidity = useMatch(routes.liquidity.path);
  const [tab, setTab] = React.useState(!!matchLiquidity ? 'liquidity' : 'exchanger');
  
  const onTabChange = (id) => {
    if (id === 'exchanger') {
      navigate(routes.exchange.path, {replace: true});
    }
    if (id === 'liquidity') {
      navigate(routes.liquidity.path, {replace: true});
    }
    setTab(id);
  }
  
  if (isConnected && chainId !== 19) {
    return <LoadModule lib={"TestnetOverlay/TestnetOverlay"} />;
  }
  
  const [isDebug, setIsDebug] = React.useState(true);
  React.useEffect(() => {
    const app = _.get(window, 'Telegram.WebApp');
    if (!app) return;
    app.ready();
    app.expand();
    if (app.SettingsButton) {
      app.SettingsButton.show();
      app.SettingsButton.onClick(() => {
        app.showPopup({
          title: 'Popup test',
          message: 'Тест кнопки',
          buttons: [
            {
              id: 0,
              type: 'ok',
            },
            {
              id: 1,
              type: 'cancel',
            },
            {
              id: 2,
              type: 'destructive',
              text: 'Нагнать жути',
            },
          ],
        });
      });
    }
    if (app.MainButton) {
      app.MainButton.show();
      app.MainButton.enable();
    }
    app.enableClosingConfirmation();
  }, []);
  
  React.useEffect(() => {
    if (app.MainButton) {
      app.MainButton.setText(isDebug ? 'Hide debug data' : 'Debug Me!');
      app.MainButton.onClick(() => {
        setIsDebug(!isDebug);
      });
      app.MainButton.show();
    }
  }, [isDebug])

  return (
    <div className="Exchanger__wrap">
      {isDebug && <>
        <div>{window.navigator.userAgent}</div>
        <div>initData: {_.get(window, 'Telegram.WebApp.initData')}</div>
        <div>version: {_.get(window, 'Telegram.WebApp.version')}</div>
        <div>platform: {_.get(window, 'Telegram.WebApp.platform')}</div>
        <div>username: {_.get(window, 'Telegram.WebApp.WebAppInitData.user.username')}</div>
        <div>user.id: {_.get(window, 'Telegram.WebApp.WebAppInitData.user.id')}</div>
        <div>chat.id: {_.get(window, 'Telegram.WebApp.WebAppInitData.chat.id')}</div>
      </>}
      <Tabs id="Exchanger"
            renderActiveTabPanelOnly
            onChange={onTabChange}
            selectedTabId={tab}>
        <Tab id="exchanger" title="Market" panel={<ExchangerContent />} />
        <Tab id="limit" title="Limit" disabled />
        <Tab id="liquidity" title="Add Liquidity" panel={<LiquidityContent />} />
      </Tabs>
      
    </div>
  );
}

export default Exchanger;
