import React from "react";
import get from "lodash/get";

const IS_TRUE_TELEGRAM = !!get(window, 'Telegram.WebApp.initData', '').length;
export const TelegramContext = React.createContext();

const app = get(window, 'Telegram.WebApp');
const storage = get(window, 'Telegram.WebApp.CloudStorage');
const COLOR_MAIN = '#A62CFF';
const COLOR_PRIMARY = '#20C997';
const COLOR_TEXT = '#FFFFFF';
let backActions = [];
function TelegramProvider(props) {
  
  const [buttonText, setButtonText] = React.useState();
  const [buttonColor, setButtonColor] = React.useState(COLOR_MAIN);
  const [buttonTextColor, setButtonTextColor] = React.useState(COLOR_TEXT);
  const [isButtonShown, setIsButtonShown] = React.useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  
  const [privateKey, _setPrivateKey] = React.useState();
  
  function setBackAction(action) {
    backActions.push(action);
    console.log('backActions', backActions);
    app.BackButton.onClick(() => {
      console.log('backActions', backActions);
      backActions.pop()();
      console.log('backActions poped', backActions);
      if (!backActions.length) {
        app.BackButton.hide();
      }
    });
    app.BackButton.show();
  }
  
  function clearBackActions() {
    backActions = [];
    app.BackButton.hide();
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
      app.MainButton.onClick(onClick);
    }
    setButtonText(text);
    setButtonColor(isPrimary ? COLOR_PRIMARY : COLOR_MAIN);
    setButtonTextColor(COLOR_TEXT);
    setIsButtonShown(true);
    setIsButtonDisabled(isDisabled);
    setIsButtonLoading(isLoading);
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
    } else {
      app.MainButton.enable();
    }
  }, [isButtonDisabled])
  
  React.useEffect(() => {
    if (!IS_TRUE_TELEGRAM) return;
    if (isButtonLoading) {
      app.MainButton.showProgress();
    } else {
      app.MainButton.hideProgress();
    }
  }, [isButtonLoading])
  
  function hideMainButton() {
    setIsButtonShown(false);
  }
  
  function mainButtonLoading() {
    setIsButtonLoading(true);
  }
  
  function mainButtonStop() {
    setIsButtonLoading(false);
  }
  
  function mainButtonEnable() {
    setIsButtonDisabled(false);
  }
  
  function mainButtonDisable() {
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
    const privateKey = await getItem('wallet-privateKey');
    _setPrivateKey(privateKey);
    return privateKey;
  };
  const setPrivateKey = async (privateKey) => {
    await setItem('wallet-privateKey', privateKey);
    _setPrivateKey(privateKey);
  };
  
  const clearPrivateKey = async () => {
    await removeItem('wallet-privateKey');
    _setPrivateKey(null);
  };
  
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
    app.setHeaderColor('#001529');
    app.ready();
    app.expand();
    initSettings();
  }, []);
  
  backActions = [];
  
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
  }}>
    {props.children}
  </TelegramContext.Provider>
}

export default TelegramProvider;
