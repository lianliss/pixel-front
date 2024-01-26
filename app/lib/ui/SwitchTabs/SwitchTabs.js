// styles
import './SwitchTabs.scss';
// external
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
// internal
import { classNames } from 'utils';

export default function SwitchTabs({
  tabs,
  selected,
  onChange,
  size,
  type,
  disabled,
  isAnimated,
}) {
  const getSelectedIndex = () => {
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].value === selected) {
        return i;
      }
    }
    return 0;
  };

  const [animation, setAnimation] = useState(false);
  const didMountRef = useRef(false);
  
  useEffect(() => {
    if (didMountRef.current) {
      setAnimation(true);
      setTimeout(() => {
        setAnimation(false);
      }, 400);
    } else {
      didMountRef.current = true;
    }
  }, [selected]);

  const indicatorWidth = 100 / tabs.length;
  return (
    <div className={classNames('SwitchTabs', size, type, { disabled })}>
      {tabs.map((tab) => {
        return (
          <div
            key={tab.value}
            className={classNames({
              SwitchTabs__item: true,
              active: tab.value === selected,
              disabled: tab.disabled,
            })}
            onClick={!tab.disabled && (tab.onClick || (() => onChange(tab.value)))}
          >
            <span>{tab.label}</span>
          </div>
        );
      })}
      {selected && (
        <div
          className={classNames('SwitchTabs__indicator', {
            animation: animation && isAnimated,
          })}
          style={{
            '--indicator-width': indicatorWidth,
            '--indicator-offset': getSelectedIndex(),
          }}
        >
          <span />
        </div>
      )}
    </div>
  );
}

SwitchTabs.defaultProps = {
  currency: {},
  isAnimated: true,
};

SwitchTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any,
      label: PropTypes.string,
    })
  ).isRequired,
  selected: PropTypes.any,
  currency: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  size: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  isAnimated: PropTypes.bool,
};
