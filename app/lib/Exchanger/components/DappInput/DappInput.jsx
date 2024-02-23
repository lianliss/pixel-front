import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import { adaptiveSelector } from 'app/store/selectors';
import { classNames } from 'utils';
import { getFixedNumber } from 'utils';
import {isNaN, trimStart} from 'lodash';

// Styles
import './DappInput.scss';

function DappInput({
  textPosition,
  indicatorPosition,
  type,
  placeholder,
  value,
  onChange,
  onFocus,
  selectLastSymbol,
  indicator,
  error,
  disabled,
  footer,
  size,
  decimals,
  inputMode,
  pattern,
  id,
  className,
  onEnter = () => {},
  ...otherProps
}) {
  const [inputState, setInputState] = React.useState(value || '');
  const adaptive = useSelector(adaptiveSelector);
  const indicatorRef = React.useRef(null);

  const [padding, setPadding] = React.useState(0);
  const style = {
    textAlign: textPosition,
  };

  React.useEffect(() => {
    // if (type === 'number') return;

    if (type === 'number') {
      if (Number(value) !== Number(inputState)) {
        if (!isNaN(value)) {
          setInputState(value);
        }
      }
      return;
    }

    if (value !== inputState) {
      setInputState(value);
    }
  }, [value]);

  // Set padding for input of indicator width.
  React.useEffect(() => {
    if (!indicator) return;
    if (!indicatorRef.current) return;

    const indicatorWidth = indicatorRef.current.clientWidth;
    const indicatorIsRight = indicatorPosition === 'right';
    const textPositionIsLeft = textPosition === 'left';
    const paddingKey =
      (textPositionIsLeft && indicatorIsRight) || indicatorIsRight
        ? 'paddingRight'
        : 'paddingLeft';
    setPadding({ [paddingKey]: indicatorWidth + 6 });
  }, []);

  const handleInput = (e) => {
    const newValue = e.currentTarget.value;

    if (type === 'number') {
      let value = `${newValue}`;
      value = value.replace(',', '.');

      if (value.length >= 2 && value[0] === '0' && value[1] !== '.') {
        value = trimStart(value, '0');
      }

      if (value === '.') {
        value = '0.';
        onChange(value);
        setInputState(value);
        return;
      }

      if (!isNaN(Number(value))) {
        onChange(getFixedNumber(Number(value), decimals));
        setInputState(getFixedNumber(value, decimals));
        return;
      }

      return;
    }

    onChange(newValue);
    setInputState(newValue);
    return;
  };

  const handleFocus = (e) => {
    e.preventDefault();

    onFocus(e);

    if (!selectLastSymbol) return;
    if (textPosition !== 'right') return;

    const input = e.currentTarget;

    setTimeout(() => {
      input.setSelectionRange(input.value.length, input.value.length);
    });
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onEnter();
    }
  };

  return (
    <div className={classNames('DappInput__wrapper', size)}>
      <input
        type="text"
        value={inputState}
        onChange={handleInput}
        className={classNames('DappInput', size, className, {
          error: error,
        })}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        inputMode={inputMode}
        pattern={pattern}
        style={{ ...style, ...padding }}
        onFocus={handleFocus}
        disabled={disabled}
        id={id && `input-` + id}
        {...otherProps}
      />
      {indicator && (
        <div
          className="DappInput__indicator"
          ref={indicatorRef}
          style={{
            [indicatorPosition]: '0',
            ['padding' +
            indicatorPosition[0].toUpperCase() +
            indicatorPosition.slice(1)]: '16px',
          }}
        >
          {indicator}
        </div>
      )}
      {footer && <div className="DappInput__footer">{footer}</div>}
    </div>
  );
}

DappInput.defaultProps = {
  textPosition: 'left',
  indicatorPosition: 'right',
  type: 'text',
  placeholder: '',
  value: '',
  onChange: () => {},
  onFocus: () => {},
  selectLastSymbol: false,
  error: false,
  size: 'medium',
  decimals: null,
  inputMode: 'text',
  pattern: null,
};

DappInput.propTypes = {
  textPosition: PropTypes.string,
  indicatorPosition: PropTypes.string,
  type: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  selectLastSymbol: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  decimals: PropTypes.number,
  inputMode: PropTypes.string,
  pattern: PropTypes.string,
};

export default DappInput;
