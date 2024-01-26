import React from 'react';
import { useSelector } from 'react-redux';

// Components
import SwapSettings from './components/SwapSettings/SwapSettings';
import {adaptiveSelector} from "app/store/selectors";

// Styles
import './DexSettingsModal.scss';

function DexSettingsModal({
  setSlippage,
  slippageTolerance,
  setDeadline,
  deadline,
  ...props
}) {
  const adaptive = useSelector(adaptiveSelector);
  const settingsProps = {
    setSlippage,
    slippageTolerance,
    slippageNumbers: [0.5, 1, 2],
    setDeadline,
    deadline,
    showTitle: true,
    onClose: props.onClose,
  };

  return (
    <div
      className="SwapSettings__wrap"
    >
      <SwapSettings {...settingsProps} />
    </div>
  );
}

export default DexSettingsModal;
