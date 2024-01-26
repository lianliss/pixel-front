import React from 'react';
import PropTypes from 'prop-types';

// Components
import {Icon} from '@blueprintjs/core';
import SectionBlock from 'ui/SectionBlock/SectionBlock';
import {Button, Input} from 'ui';

// Styles
import './SwapSettings.scss';

function SwapSettings({
  setSlippage,
  slippageTolerance,
  slippageNumbers,
  setDeadline,
  deadline,
  showTitle,
  onClose,
}) {
  const transactionSpeeds = [
    { id: 0, title: "Standart", amount: 7 },
    { id: 2, title: "Fast", amount: 3 },
    { id: 3, title: "Instant", amount: 8 },
  ];

  const [transactionSpeed, setTransactionSpeed] = React.useState(0);
  const [slippageValue, setSlippageValue] = React.useState(slippageTolerance);
  const [deadlineValue, setDeadlineValue] = React.useState(deadline);

  const handleSlippage = (_value) => {
    let value = Number(_value);
    if (value < 0.1) value = 0.1;
    if (value > 100) value = 100;
    setSlippageValue(_value);
    setSlippage(value);
    window.localStorage.setItem('nrfx-slippage', value);
  };

  const handleDeadline = (_value) => {
    let value = Number(_value);
    if (value < 1) value = 1;
    if (value > 60) value = 60;
    setDeadlineValue(_value);
    setDeadline(value);
  };

  return (
    <div className="SwapSettings">
      {showTitle && (
        <h2>
          <span>Swap settings</span>
          <span className="SwapSettings__close" onClick={onClose}>
            <Icon icon={"cross"} />
          </span>
        </h2>
      )}
      <SectionBlock
        title={"Transaction speed"}
        // title="Default Transaction Speed (GWEI)"
        className="transaction-speed"
      >
        {transactionSpeeds.map((item, index) => {
          return (
            <Button
              type="secondary-blue"
              size="medium"
              className={item.id === transactionSpeed ? 'active' : ''}
              onClick={() => setTransactionSpeed(item.id)}
              key={index}
            >
              {item.title} ({item.amount})
            </Button>
          );
        })}
      </SectionBlock>
      <SectionBlock
        title={
          <>
            <span>{"Slippage tolerance"}</span>
            <Icon icon={"help"} />
          </>
        }
        className="slippage"
      >
        {slippageNumbers.map((number, key) => (
          <Button
            type="secondary-blue"
            onClick={() => handleSlippage(number)}
            size="medium"
            key={key}
          >
            {number}%
          </Button>
        ))}
        <div className="Input__container">
          <Input
            type="number"
            value={slippageValue}
            onTextChange={(value) => handleSlippage(value)}
          />
          <div className="Input__icon">%</div>
        </div>
      </SectionBlock>
      <div className="deadline">
        <div className="deadline__title">
          {"Deadline"}
          <Icon icon={"help"} />
        </div>
        <div className="Input__container">
          <Input
            type="number"
            value={deadlineValue}
            onTextChange={(value) => handleDeadline(value)}
          />
          <div className="Input__icon">
            {"minutes"}
          </div>
        </div>
      </div>
    </div>
  );
}

SwapSettings.propTypes = {
  setSlippage: PropTypes.func,
  slippageTolerance: PropTypes.number,
  slippageNumbers: PropTypes.arrayOf(PropTypes.number),
  setDeadline: PropTypes.func,
  deadline: PropTypes.number,
  showTitle: PropTypes.bool,
  onClose: PropTypes.func,
};

SwapSettings.defaultProps = {
  setSlippage: () => {},
  slippageTolerance: 0,
  slippageNumbers: [0.5],
  setDeadline: () => {},
  deadline: 0,
  showTitle: false,
  onClose: () => {},
};

export default SwapSettings;
