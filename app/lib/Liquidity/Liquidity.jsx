import React from 'react';

// Components
import LiquidityAdd from './components/LiquidityAdd/LiquidityAdd';
import LiquidityRemove from './components/LiquidityRemove/LiquidityRemove';
import LiquidityMain from './components/LiquidityMain/LiquidityMain';
import get from 'lodash/get';
import uniq from 'lodash/uniq';
import { Web3Context } from 'services/web3Provider';

// Styles
import './Liquidity.scss';

// Main
function Liquidity() {
  const routerParams = {};
  const routerTokens = {
    token0: routerParams.token0,
    token1: routerParams.token1,
    isExists: !!routerParams.token0 && !!routerParams.token1,
  };

  // Display oneOf["add", "remove", "main"] page
  const [currentPool, setCurrentPool] = React.useState(null);
  const [currentDisplay, setCurrentDisplay] = React.useState('main');
  const context = React.useContext(Web3Context);
  const POOLS_LIST_KEY = `narfex-pools-list-${context.chainId}`;
  let storagePools;
  try {
    storagePools =
      JSON.parse(window.localStorage.getItem(POOLS_LIST_KEY)) || [];
  } catch (error) {
    storagePools = [];
  }
  const [userPools, setUserPools] = React.useState(storagePools);
  const poolsList = uniq([
    ...get(context, 'poolsList', []),
    ...get(context, 'customLP', []).map(lp => lp.address),
    //...userPools,
  ]);

  const addPool = (_poolAddress) => {
    context.addCustomLP(_poolAddress);
    const poolAddress = _poolAddress.toLowerCase();
    if (
      get(context, 'poolsList', []).indexOf(poolAddress) >= 0 ||
      userPools.indexOf(poolAddress) >= 0
    )
      return;
    const newList = [...userPools, poolAddress];
    window.localStorage.setItem(POOLS_LIST_KEY, JSON.stringify(newList));
    setUserPools(newList);
  };

  const removePool = (_poolAddress) => {
    const poolAddress = _poolAddress.toLowerCase();
    if (
      get(context, 'poolsList', []).indexOf(poolAddress) >= 0 ||
      userPools.indexOf(poolAddress) < 0
    )
      return;
    const newList = userPools.filter((p) => p !== poolAddress);
    window.localStorage.setItem(POOLS_LIST_KEY, JSON.stringify(newList));
    setUserPools(newList);
  };

  React.useEffect(() => {
    if(context.isConnected && routerTokens.isExists) {
      setCurrentDisplay('add');
    }
  }, []);

  return (
    <div className={`Liquidity ${currentDisplay}`}>
      {currentDisplay === 'main' && (
        <LiquidityMain
          poolsList={poolsList}
          onAddClick={(pairAddress) => {
            setCurrentPool(pairAddress);
            setCurrentDisplay('add');
          }}
          onRemoveClick={(pairAddress) => {
            setCurrentPool(pairAddress);
            setCurrentDisplay('remove');
          }}
          onImportClick={() => setCurrentDisplay('import')}
        />
      )}
      {currentDisplay === 'add' && (
        <LiquidityAdd
          routerTokens={routerTokens}
          currentPool={currentPool}
          onClose={() => {
            setCurrentDisplay('main');
          }}
        />
      )}
      {currentDisplay === 'remove' && (
        <LiquidityRemove
          removePool={removePool}
          currentPool={currentPool}
          onClose={() => {
            setCurrentDisplay('main');
          }}
        />
      )}
      {currentDisplay === 'import' && (
        <LiquidityAdd
          addPool={addPool}
          onClose={() => {
            setCurrentDisplay('main');
          }}
          type="import"
        />
      )}
    </div>
  );
}

export default Liquidity;
