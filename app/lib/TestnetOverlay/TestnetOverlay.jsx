import React from 'react';
import PropTypes from 'prop-types';

import { Web3Context } from 'services/web3Provider';
import { Button } from 'ui';
import { METAMASK } from 'services/multiwallets/connectors';
import networkTypes from './constants/networks';

import './TestnetOverlay.scss';

const TestnetOverlay = (props) => {
  const context = React.useContext(Web3Context);
  const { chainId, switchToChain, isConnected, connector, connectWallet } =
    context;

  const Body = ({ isChainChanger }) => {
    let text = 'Connection error';

    return (
      <div className="TestnetOverlay__wrap">
        <div className="TestnetOverlay__background"></div>
        <div className="TestnetOverlay__content">
          <h2>{text}</h2>
          <p>
            {"Please switch chain to"}&nbsp;
            {networkTypes[19]}.
          </p>
          <div className="TestnetOverlay__buttons">
            {chainId && connector === METAMASK && (
              <Button
                onClick={() => {
                  switchToChain(19);
                }}
                large
                primary
              >
                Switch your chain
              </Button>
            )}
            {/*<Button*/}
            {/*  onClick={() => connectWallet(connector || 'metamask')}*/}
            {/*  primary*/}
            {/*  large*/}
            {/*>*/}
            {/*  Reconnect wallet*/}
            {/*</Button>*/}
          </div>
        </div>
      </div>
    );
  };
  
  if (isConnected && chainId !== 19) {
    return <Body isChainChanger />;
  } else {
    return <></>;
  }
};

TestnetOverlay.propTypes = {
  networks: PropTypes.array,
};

TestnetOverlay.defaultProps = {
  networks: [],
};

export default TestnetOverlay;
