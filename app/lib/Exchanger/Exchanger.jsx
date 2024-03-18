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
import get from 'lodash/get';
import useExchanger from 'app/hooks/useExchanger';
import { Web3Context } from 'services/web3Provider';

// Styles
import './Exchanger.scss';
import {TelegramContext} from "services/telegramProvider";

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
  console.log('EXCHANGER');
  const { accountAddress, isConnected, chainId } =
    React.useContext(Web3Context);
  const {haptic} = React.useContext(TelegramContext);
  const navigate = useNavigate();
  const matchLiquidity = useMatch(routes.liquidity.path);
  const [tab, setTab] = React.useState(!!matchLiquidity ? 'liquidity' : 'exchanger');
  
  const onTabChange = (id) => {
    haptic.soft();
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
  
  const [isDebug, setIsDebug] = React.useState(false);

  return (
    <div className="Exchanger__wrap">
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
