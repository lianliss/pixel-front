import React from 'react';

// Components
import {Icon} from '@blueprintjs/core';

// Utils
import get from 'lodash/get';

// Styles
import './DexRoute.scss';

function DexRoute({ route = [], tokens = [] }) {
  return (
    <div className="DexRoute">
      <h2>
        <span>{"Route"}</span>
      </h2>
      <div className="DexRoute-container">
        {route &&
          route.map((symbol, index) => {
            const token = tokens.find((t) => t.symbol === symbol);
            const logo = get(token, 'logoURI', '');
            return (
              <div className="DexRoute-symbol" key={`${symbol}-${index}`}>
                {!!index && (
                  <Icon icon={"chevron-right"} className="DexRoute-arrow" />
                )}
                <div
                  className="DexRoute-logo"
                  style={{ backgroundImage: `url('${logo}')` }}
                />
                <span>{symbol}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default DexRoute;
