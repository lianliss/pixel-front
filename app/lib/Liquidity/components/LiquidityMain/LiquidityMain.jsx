import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router5';
import { Web3Context } from 'services/web3Provider';

// Components
import { Button } from 'ui';
import LiquidityList from '../LiquidityList/LiquidityList';

// Constants

// Styles
import './LiquidityMain.scss';
import {ModalContext} from "services/ModalProvider";
import {Icon} from "@blueprintjs/core";

// Main
function LiquidityMain({
  onAddClick,
  onRemoveClick,
  onImportClick,
  poolsList,
}) {
  const {connectToWalletModal} = React.useContext(ModalContext);
  const context = React.useContext(Web3Context);
  const { isConnected, connectWallet } = context;

  return (
    <>
      {!!isConnected ? (
        <>
          <div className="Liquidity__header">
            <div className="Liquidity__title">
              Liquidity pools
            </div>
            <p className="default-text">
              Description
            </p>
            <Button
              large
              primary
              rightIcon={'small-plus'}
              onClick={() => onAddClick()}
            >
              Add Liquidity
            </Button>
          </div>
        </>
      ) : (
        <div className="Liquidity__header">
          <div className="Liquidity__title">
            Liquidity pools
          </div>
          <Button
            primary
            icon={"antenna"}
            large
            onClick={() => connectToWalletModal()}
          >
            Connect wallet
          </Button>
        </div>
      )}
      <div className="Liquidity__body">
        <div className="Liquidity__subtitle">
          <span>Your liquidity</span>
          <Icon icon={"help"} />
        </div>
        <LiquidityList
          onAddClick={onAddClick}
          onRemoveClick={onRemoveClick}
          poolsList={poolsList}
          emptyText={
            isConnected
              ? "No liquidity"
              : "Wallet is not connected"
          }
        />
      </div>
      <div className="Liquidity__footer">
        <p className="default-text">
          Don't see you LP tokens?&nbsp;
          <Button onClick={() => onImportClick()}>
            Import
          </Button>
        </p>
      </div>
    </>
  );
}

LiquidityMain.propTypes = {
  onAddClick: PropTypes.func,
  onRemoveClick: PropTypes.func,
};

LiquidityMain.defaultProps = {
  onAddClick: () => {},
  onRemoveClick: () => {},
};

export default LiquidityMain;
