import React from 'react';

// Components
import { DexRoute } from 'ui';

// Utils
import { Web3Context } from 'services/web3Provider';
import { ratesSelector } from 'app/store/selectors';
import { useSelector } from 'react-redux';

function ExchangeRoute({ route }) {
  const rates = useSelector(ratesSelector);
  const { getFiatsArray, tokens, fiats } = React.useContext(Web3Context);
  const [allTokens, setAllTokens] = React.useState([]);

  React.useEffect(() => {
    const fiats = getFiatsArray(rates);
    setAllTokens([...tokens, ...fiats]);
  }, [fiats, tokens]);

  return <DexRoute tokens={allTokens} route={route} />;
}

export default React.memo(ExchangeRoute);
