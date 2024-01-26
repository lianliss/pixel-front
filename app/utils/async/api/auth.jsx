'use strict';
import Api from 'utils/async/api';
const api = new Api('/api/auth/');

const methods = {
  getCaptcha: () => api.get('captcha'),
  getToken: (hash, captcha) => api.get('auth', {
    params: {hash, captcha},
  }),
  createAccount: (captcha) => api.post('create', {
    params: {captcha},
  }),
};

export default methods;
