import React from 'react';

// Components
import { Button } from 'ui';
import {Icon} from '@blueprintjs/core';
import SwapSettings from 'services/ModalProvider/Modals/DexSettingsModal/components/SwapSettings/SwapSettings';

// Utils
import { classNames as cn } from 'utils';

// Styles
import './ExchangerSettings.scss';

function ExchangerSettings(props) {
  const [isActive, setIsActive] = React.useState(false);
  const {
    slippage,
    setSlippage,
    deadline,
    setDeadline,
  } = props;

  return (
    <div className="ExchangerModal__Settings">
      <Button
        large
        icon={"settings"}
        rightIcon={isActive ? "chevron-up" : "chevron-down"}
        onClick={() => setIsActive((prevState) => !prevState)}
        className={'settings-toggler'}
      >
        {isActive ? "Close" : "Open"}
        &nbsp;
        settings
      </Button>
      <div
        className={cn({ ExchangerModal__Settings__container: true, isActive })}
      >
        <SwapSettings
          slippageNumbers={[0.1, 0.5, 1]}
          {...{
            slippageTolerance: slippage,
            setSlippage,
            deadline,
            setDeadline,
          }} />
      </div>
    </div>
  );
}

export default ExchangerSettings;
