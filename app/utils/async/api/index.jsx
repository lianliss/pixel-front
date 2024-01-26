import {Request} from 'utils/async/request';
import {API_URL} from 'const';
import Store from 'app/store';
import {appUpdateAccount} from 'slices/App';
import {
  OverlayToaster,
} from '@blueprintjs/core';

const toaster = OverlayToaster.create({position: "top", usePortal: true});

class Api extends Request {
  
  constructor(url, config) {
    super(config);
    this.url = url;
  }
  
  getUrl = (path = '') => new URL(this.url + path, API_URL).href;
  
  processError = (method, url, error, isSilent = false) => {
    try {
      if (!error) {
        //window.location.reload();
        return;
      }
      const {status} = error;
      let message = error.message || error.data || error.statusText;
      console.error('[Api]', `[${method}]`, url, {
        status,
        message,
      }, error);
      
      if (status === 401) {
        !isSilent && toaster.show({
          intent: 'warning',
          message,
          icon: 'ban-circle',
        });
        document.cookie = 'auth-token=; Max-Age=-99999999;';
        Store.dispatch(appUpdateAccount(null));
      } else {
        !isSilent && toaster.show({
          intent: 'danger',
          message: `[${status}] ${message}`,
          icon: 'error',
          //timeout: 10000,
        });
      }
    } catch (processError) {
      console.error('[Api][processError]', processError);
    }
  };
  
  get(path, options = {}) {return new Promise((fulfill, reject) => {
    const url = this.getUrl(path);
    super.get(url, options).then(fulfill).catch(error => {
      this.processError('GET', url, error, options.isSilent);
      reject(error);
    })
  })};
  
  post(path, options = {}) {return new Promise((fulfill, reject) => {
    const url = this.getUrl(path);
    super.post(url, options).then(fulfill).catch(error => {
      this.processError('POST', url, error, options.isSilent);
      reject(error);
    })
  })};
}

export default Api;
