import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import isNull from 'lodash/isNull';
import isNaN from 'lodash/isNaN';
import trimStart from 'lodash/trimStart';
import wei from 'utils/wei';
import getFinePrice from 'utils/getFinePrice';
import { useSelector } from 'react-redux';

// Components.
import {Icon} from '@blueprintjs/core';
import {Input} from 'ui';

// Styles.
import './DexSwapInput.scss';
import {TelegramContext} from "services/telegramProvider";

const isNullOrNaN = value => isNull(value) || isNaN(value);

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
  const {haptic} = React.useContext(TelegramContext);
  const adaptive = useSelector((store) => store.App.adaptive);

  // Refs
  const inputRef = React.useRef(null);
  const selectRef = React.useRef(null);

  // Logic
  const balanceNumber = Number(wei.from(get(token, 'balance', "0"), get(token, 'decimals', 18)));

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
      value = trimStart(value, '0');
    }
    if (!isNaN(Number(value)) || value === '.') {
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

  const tokenAddress = get(token, 'address');
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
          backgroundImage: `url('${get(token, 'logoURI', '')}')`
        }} onClick={onSelectToken} />
        <div className="DexSwapInput__select" onClick={onSelectToken} ref={selectRef}>
          <span>{get(token, 'name', 'Unknown')}</span>
          <div className="DexSwapInput__currency">
            <span>{get(token, 'symbol', 'Unknown')}</span>
            <Icon icon={"chevron-down"} />
          </div>
        </div>
        <div className="DexSwapInput__input">
          <Input
            ref={inputRef}
            type={adaptive ? 'number' : 'text'}
            onTextChange={handleInput}
            value={textValue}
            onClick={() => haptic.tiny()}
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
