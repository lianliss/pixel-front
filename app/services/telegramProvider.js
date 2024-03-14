import React from "react";
import get from "lodash/get";

const IS_TRUE_TELEGRAM = !!get(window, 'Telegram.WebApp.initData', '').length;
export const TelegramContext = React.createContext();

const app = get(window, 'Telegram.WebApp');
const storage = get(window, 'Telegram.WebApp.CloudStorage');
const COLOR_MAIN = '#A62CFF';
const COLOR_MAIN_DISABLED = '#41275C';
const COLOR_PRIMARY = '#20C997';
const COLOR_PRIMARY_DISABLED = '#296555';
const COLOR_TEXT = '#FFFFFF';
const COLOR_TEXT_DISABLED = '#b7b7b7';
const COLOR_PANEL = '#001A32';
let backActions = [];
let mainButtonClick = () => {};
function TelegramProvider(props) {
  
  const [buttonText, setButtonText] = React.useState();
  const [buttonColor, setButtonColor] = React.useState(COLOR_MAIN);
  const [buttonTextColor, setButtonTextColor] = React.useState(COLOR_TEXT);
  const [isButtonPrimary, setIsButtonPrimary] = React.useState(false);
  const [isButtonShown, setIsButtonShown] = React.useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [backActionsLength, setBackActionsLength] = React.useState(0);
  
  const [privateKey, _setPrivateKey] = React.useState();
  
  const [telegramId, setTelegramId] = React.useState();
  const [telegramUserName, setTelegramUserName] = React.useState();
  const [telegramFirstName, setTelegramFirstName] = React.useState();
  const [telegramLastName, setTelegramLastName] = React.useState();
  
  const _haptic = (weight = 1) => {
    if (!IS_TRUE_TELEGRAM) return;
    switch (weight) {
      case 0:
        app.HapticFeedback.impactOccurred('light');
        break;
      case 1:
        app.HapticFeedback.impactOccurred('medium');
        break;
      case 'soft':
        app.HapticFeedback.impactOccurred('soft');
        break;
      case 'tiny':
        app.HapticFeedback.selectionChanged();
        break;
      case 'rigid':
        app.HapticFeedback.impactOccurred('rigid');
        break;
      case 'success':
      case 'warning':
      case 'error':
        app.HapticFeedback.notificationOccurred(weight);
        break;
      case 2:
      default:
        app.HapticFeedback.impactOccurred('heavy');
    }
  }
  
  const haptic = {
    click: weight => _haptic(weight),
    soft: () => _haptic('soft'),
    small: () => _haptic(0),
    normal: () => _haptic(1),
    medium: () => _haptic(1),
    heavy: () => _haptic(2),
    error: () => _haptic('error'),
    success: () => _haptic('success'),
    warn: () => _haptic('warning'),
    tiny: () => _haptic('tiny'),
    rigid: () => _haptic('rigid'),
  }
  
  function backActionClick() {
    haptic.medium();
    const action = backActions.pop();
    action();
    if (!backActions.length) {
      app.BackButton.hide();
    }
    setBackActionsLength(backActions.length);
  }
  
  function initBackButton() {
    app.BackButton.onClick(backActionClick);
  }
  
  function setBackAction(action) {
    backActions.push(action);
    app.BackButton.show();
    setBackActionsLength(backActions.length);
  }
  
  function clearBackActions() {
    backActions = [];
    app.BackButton.hide();
    setBackActionsLength(0);
  }
  
  const getButtonColor = (isPrimary = isButtonPrimary, isDisabled = isButtonDisabled) => {
    if (isPrimary) {
      return isDisabled
        ? COLOR_PRIMARY_DISABLED
        : COLOR_PRIMARY;
    } else {
      return isDisabled
        ? COLOR_MAIN_DISABLED
        : COLOR_MAIN;
    }
  }
  
  function setMainButton({
    text,
    onClick,
    isDisabled = false,
    isLoading = false,
    isPrimary = false,
  }) {
    if (!IS_TRUE_TELEGRAM) return;
    if (text) {
      setButtonText(text);
    }
    if (typeof onClick === 'function') {
      app.MainButton.offClick(mainButtonClick);
      mainButtonClick = onClick;
      app.MainButton.onClick(mainButtonClick);
    }
    setButtonText(text);
    setIsButtonPrimary(isPrimary);
    setIsButtonShown(true);
    setIsButtonDisabled(isDisabled);
    setIsButtonLoading(isLoading);
    setButtonColor(getButtonColor(isPrimary, isDisabled));
    setButtonTextColor(isDisabled ? COLOR_TEXT_DISABLED : COLOR_TEXT);
  }
  
  React.useEffect(() => {
    if (!IS_TRUE_TELEGRAM) return;
    app.MainButton.setText(buttonText);
  }, [buttonText])
  
  React.useEffect(() => {
    if (!IS_TRUE_TELEGRAM) return;
    app.MainButton.setParams({
      color: buttonColor,
      text_color: buttonTextColor,
    });
  }, [buttonColor, buttonTextColor])
  
  React.useEffect(() => {
    if (!IS_TRUE_TELEGRAM) return;
    if (isButtonShown) {
      app.MainButton.show();
    } else {
      app.MainButton.hide();
    }
  }, [isButtonShown])
  
  React.useEffect(() => {
    if (!IS_TRUE_TELEGRAM) return;
    if (isButtonDisabled) {
      app.MainButton.disable();
      setButtonColor(getButtonColor());
      setButtonTextColor(isButtonDisabled ? COLOR_TEXT_DISABLED : COLOR_TEXT);
    } else {
      app.MainButton.enable();
      setButtonColor(getButtonColor());
      setButtonTextColor(isButtonDisabled ? COLOR_TEXT_DISABLED : COLOR_TEXT);
    }
  }, [isButtonDisabled])
  
  React.useEffect(() => {
    setButtonColor(getButtonColor());
    setButtonTextColor(isButtonDisabled ? COLOR_TEXT_DISABLED : COLOR_TEXT);
  }, [isButtonPrimary]);
  
  React.useEffect(() => {
    if (!IS_TRUE_TELEGRAM) return;
    if (isButtonLoading) {
      app.MainButton.showProgress();
    } else {
      app.MainButton.hideProgress();
    }
  }, [isButtonLoading])
  
  function hideMainButton() {
    if (!IS_TRUE_TELEGRAM) return;
    setIsButtonShown(false);
  }
  
  function mainButtonLoading(isDisable) {
    if (!IS_TRUE_TELEGRAM) return;
    setIsButtonLoading(true);
    if (isDisable) {
      setIsButtonDisabled(true);
    }
  }
  
  function mainButtonStop(isEnable) {
    if (!IS_TRUE_TELEGRAM) return;
    setIsButtonLoading(false);
    if (isEnable) {
      setIsButtonDisabled(false);
    }
  }
  
  function mainButtonEnable() {
    if (!IS_TRUE_TELEGRAM) return;
    setIsButtonDisabled(false);
  }
  
  function mainButtonDisable() {
    if (!IS_TRUE_TELEGRAM) return;
    setIsButtonDisabled(true);
  }
  
  const getItem = (key) => new Promise((fulfill, reject) => {
    if (!IS_TRUE_TELEGRAM) return fulfill(null);
    storage.getItem(key, (error, value) => {
      if (error) {
        reject(error);
      } else {
        fulfill(value);
      }
    })
  });
  
  const setItem = (key, value) => new Promise((fulfill, reject) => {
    if (!IS_TRUE_TELEGRAM) return fulfill(value);
    return storage.setItem(key, value, error => {
      if (error) {
        reject(error);
      } else {
        fulfill(value);
      }
    });
  });
  
  const removeItem = (key) => new Promise((fulfill, reject) => {
    if (!IS_TRUE_TELEGRAM) return fulfill(null);
    storage.removeItem(key, error => {
      if (error) {
        reject(error);
      } else {
        fulfill(null);
      }
    })
  })
  
  const getPrivateKey = async () => {
    if (!IS_TRUE_TELEGRAM) return;
    const privateKey = await getItem('wallet-privateKey');
    _setPrivateKey(privateKey);
    return privateKey;
  };
  const setPrivateKey = async (privateKey) => {
    if (!IS_TRUE_TELEGRAM) return;
    await setItem('wallet-privateKey', privateKey);
    _setPrivateKey(privateKey);
  };
  
  const clearPrivateKey = async () => {
    if (!IS_TRUE_TELEGRAM) return;
    await removeItem('wallet-privateKey');
    _setPrivateKey(null);
  };
  
  const scanQR = (callback, text = '') => {
    if (!IS_TRUE_TELEGRAM) return;
    app.showScanQrPopup({
      text,
    }, callback);
  }
  
  const readFromClipboard = () => new Promise((fulfill, reject) => {
    if (!IS_TRUE_TELEGRAM) return fulfill();
    app.readTextFromClipboard(fulfill);
  })
  
  function initSettings() {
    if (!IS_TRUE_TELEGRAM) return;
    app.SettingsButton.show();
    app.SettingsButton.onClick(() => {
      app.showPopup({
        title: 'Settings',
        message: 'The application is in Development mode',
        buttons: [
          {
            id: 'scanQR',
            type: 'default',
            text: 'ScanQR',
          },
          {
            id: 'Show Secret',
            type: 'default',
            text: 'Show Secret',
          },
          {
            id: 'clearPrivateKey',
            type: 'destructive',
            text: 'Logout',
          },
        ],
      }, id => {
        switch (id) {
          case 'clearPrivateKey':
            app.showConfirm('The private key will be deleted. It will be possible to restore the wallet only using a secret phrase. Are you sure you want to delete your wallet?', (isOk) => {
              if (isOk) {
                clearPrivateKey();
                window.location.reload();
              }
            });
            break;
          case 'scanQR':
          default:
            app.showScanQrPopup({
              text: `${id}`,
            }, code => {
              app.showConfirm(code);
              return true;
            });
        }
      });
    });
  }
  
  React.useEffect(() => {
    if (!IS_TRUE_TELEGRAM) return;
    app.setHeaderColor(COLOR_PANEL);
    app.ready();
    app.expand();
    initBackButton();
    initSettings();
    setTelegramId(app.initDataUnsafe.user.id);
    setTelegramUserName(app.initDataUnsafe.user.username);
    setTelegramFirstName(app.initDataUnsafe.user.first_name);
    setTelegramLastName(app.initDataUnsafe.user.last_name);
  }, []);
  
  //backActions = [];
  
  return <TelegramContext.Provider value={{
    privateKey,
    setBackAction,
    clearBackActions,
    setMainButton,
    hideMainButton,
    mainButtonLoading,
    mainButtonStop,
    mainButtonEnable,
    mainButtonDisable,
    getPrivateKey,
    setPrivateKey,
    clearPrivateKey,
    scanQR,
    readFromClipboard,
    backActionsLength,
    backActionClick,
    telegramId,
    telegramUserName,
    telegramFirstName,
    telegramLastName,
    haptic,
  }}>
    {props.children}
  </TelegramContext.Provider>
}

export default TelegramProvider;
