import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import wei from 'utils/wei';
import getFinePrice from 'utils/getFinePrice';
import { useSelector } from 'react-redux';

// Components.
import {Icon} from '@blueprintjs/core';
import {Input} from 'ui';

// Styles.
import './DexSwapInput.scss';

const isNullOrNaN = value => _.isNull(value) || _.isNaN(value);

function DexSwapInput({
                        title,
                        manage,
                        label,
                        token,
                        showBalance,
                        value,
                        onChange,
                        onSelectToken,
                        setExact,
                        onFocus,
                      }) {
  // States
  const [textValue, setTextValue] = React.useState(value);
  const adaptive = useSelector((store) => store.default.adaptive);

  // Refs
  const inputRef = React.useRef(null);
  const selectRef = React.useRef(null);

  // Logic
  const balanceNumber = Number(wei.from(_.get(token, 'balance', "0"), _.get(token, 'decimals', 18)));

  // Handlers
  const handleInput = newValue => {
    if (adaptive) {
      setTextValue(newValue);
      onChange(Number(newValue));
      return;
    }
    let value = `${newValue}`;
    value = value.replace(',', '.');
    if (value.length >= 2 && value[0] === '0' && value[1] !== '.') {
      value = _.trimStart(value, '0');
    }
    if (!_.isNaN(Number(value)) || value === '.') {
      setTextValue(value);
      onChange(Number(value));
    }
  };

  React.useEffect(() => {
    if (Number(textValue) !== value && !isNullOrNaN(Number(value))) {
      setTextValue(`${value}`);
    }
  }, [value]);

  const handleContainerClick = (e) => {
    if (!selectRef.current.contains(e.target)) {
      inputRef.current.focus();
      setExact();
      onFocus();
    }
  };

  const handleBalanceClick = () => {
    handleInput(balanceNumber);
  };

  const tokenAddress = _.get(token, 'address');
  React.useEffect(() => {
    if (!isNullOrNaN(Number(value))) {
      onChange('0');
    }
  }, [tokenAddress]);

  // Render
  return (
    <div className="DexSwapInput" onClick={handleContainerClick}>
      {label && (
        <div className="DexSwapInput__label">
          <div>
            <span className="DexSwapInput__title">{title}</span>
            {manage}
          </div>
          {(!!balanceNumber && showBalance) && <div>
            <span className={`DexSwapInput__balance ${balanceNumber === value
              ? 'active'
              : ''}`}
                  onClick={handleBalanceClick}>
              {"Balance"} ≈ {getFinePrice(balanceNumber)}
            </span>
          </div>}
        </div>
      )}
      <div className="DexSwapInput__container">
        <div className="DexSwapInput__icon" style={{
          backgroundImage: `url('${_.get(token, 'logoURI', '')}')`
        }} onClick={onSelectToken} />
        <div className="DexSwapInput__select" onClick={onSelectToken} ref={selectRef}>
          <span>{_.get(token, 'name', 'Unknown')}</span>
          <div className="DexSwapInput__currency">
            <span>{_.get(token, 'symbol', 'Unknown')}</span>
            <Icon icon={"chevron-down"} />
          </div>
        </div>
        <div className="DexSwapInput__input">
          <Input
            ref={inputRef}
            type={adaptive ? 'number' : 'text'}
            onTextChange={handleInput}
            value={textValue}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}

DexSwapInput.propTypes = {
  title: PropTypes.string,
  manage: PropTypes.any,
  label: PropTypes.bool,
  showBalance: PropTypes.bool,
  onSelectToken: PropTypes.func,
  onChange: PropTypes.func,
  setExact: PropTypes.func,
  value: PropTypes.any,
  token: PropTypes.object,
  onFocus: PropTypes.func,
};

DexSwapInput.defaultProps = {
  title: '',
  manage: null,
  label: false,
  showBalance: false,
  onSelectToken: () => {},
  setExact: () => {},
  onFocus: () => {},
};

export default DexSwapInput;
