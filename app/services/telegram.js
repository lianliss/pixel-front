import get from 'lodash/get';

const IS_TRUE_TELEGRAM = !!get(window, 'Telegram.WebApp.initData', '').length;

class Telegram {
  app = get(window, 'Telegram.WebApp');
  storage = get(window, 'Telegram.WebApp.CloudStorage');
  mainColor = '#A62CFF';
  primaryColor = '#20C997';
  textColor = '#FFFFFF';
  backActions = [];
  
  init() {
    if (!IS_TRUE_TELEGRAM) return;
    this.app.setHeaderColor('#001529');
    this.app.ready();
    this.app.expand();
    this.initSettings();
  }
  
  setBackAction(action) {
    this.backActions.push(action);
    this.app.BackButton.onClick(() => {
      this.backActions.pop()();
      if (!this.backActions.length) {
        this.app.BackButton.hide();
      }
    });
    this.app.BackButton.show();
  }
  
  clearBackActions() {
    this.backActions = [];
    this.app.BackButton.hide();
  }
  
  setMainButton({
                  text,
                  onClick,
                  color = this.mainColor,
                  textColor = this.textColor,
                  isDisabled = false,
                  isLoading = false,
                }) {
    if (!IS_TRUE_TELEGRAM) return;
    const button = this.app.MainButton;
    if (text) {
      button.setText(text);
    }
    if (typeof onClick === 'function') {
      button.onClick(onClick);
    }
    button.setParams({
      color,
      text_color: textColor,
    });
    button.show();
    if (isDisabled) {
      button.disable();
    } else {
      button.enable();
    }
    if (isLoading) {
      button.showProgress();
    } else {
      button.hideProgress();
    }
  }
  
  hideMainButton() {
    if (!IS_TRUE_TELEGRAM) return;
    this.app.MainButton.hide();
  }
  
  mainButtonLoading() {
    if (!IS_TRUE_TELEGRAM) return;
    this.app.MainButton.showProgress();
  }
  
  mainButtonStop() {
    if (!IS_TRUE_TELEGRAM) return;
    this.app.MainButton.hideProgress();
  }
  
  mainButtonEnable() {
    if (!IS_TRUE_TELEGRAM) return;
    this.app.MainButton.enable();
  }
  
  mainButtonDisable() {
    if (!IS_TRUE_TELEGRAM) return;
    this.app.MainButton.disable();
  }
  
  setItem = (key, value) => new Promise((fulfill, reject) => {
    if (!IS_TRUE_TELEGRAM) return fulfill(value);
    return this.storage.setItem(key, value, error => {
      if (error) {
        reject(error);
      } else {
        fulfill(value);
      }
    });
  });
  getItem = (key) => new Promise((fulfill, reject) => {
    if (!IS_TRUE_TELEGRAM) return fulfill(null);
    this.storage.getItem(key, (error, value) => {
      if (error) {
        reject(error);
      } else {
        fulfill(value);
      }
    })
  });
  
  removeItem = (key) => new Promise((fulfill, reject) => {
    if (!IS_TRUE_TELEGRAM) return fulfill(null);
    this.storage.removeItem(key, error => {
      if (error) {
        reject(error);
      } else {
        fulfill(null);
      }
    })
  })
  
  getPrivateKey = () => this.getItem('wallet-privateKey');
  setPrivateKey = privateKey => this.setItem('wallet-privateKey', privateKey);
  
  clearPrivateKey = () => this.removeItem('wallet-privateKey');
  
  initSettings() {
    if (!IS_TRUE_TELEGRAM) return;
    const {app} = this;
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
            this.app.showConfirm('The private key will be deleted. It will be possible to restore the wallet only using a secret phrase. Are you sure you want to delete your wallet?', (isOk) => {
              if (isOk) {
                this.clearPrivateKey();
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
}

const telegram = new Telegram();

export default telegram;
