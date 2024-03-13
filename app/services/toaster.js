import React from 'react';
import {
  OverlayToaster,
} from '@blueprintjs/core';
import getFinePrice from "utils/getFinePrice";

export const toaster = OverlayToaster.create({
  position: "top",
  usePortal: true,
  className: 'bp5-dark',
});
toaster.success = message => {
  toaster.show({
    intent: 'success',
    message,
    icon: 'endorsed',
  });
}
toaster.error = message => {
  toaster.show({
    intent: 'danger',
    message,
    icon: 'error',
  });
}
toaster.warning = message => {
  toaster.show({
    intent: 'warning',
    message,
    icon: 'warning-sign',
  });
}
toaster.gas = (gas, symbol = 'SGB') => {
  toaster.show({
    intent: 'warning',
    message: <>
      Not enough gas<br/>
      Need {getFinePrice(gas)} {symbol}
      </>,
    icon: 'warning-sign',
  });
}

export default toaster;
