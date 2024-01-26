import {
  OverlayToaster,
} from '@blueprintjs/core';

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

export default toaster;
